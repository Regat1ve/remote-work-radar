"""Turn RawJob into NormalizedJob.

Every parse function is named parse_X and takes the description text (already stripped
of HTML by html_to_markdown) plus the title, and returns a specific typed thing.

If a parser cannot find a value, it returns None. Never guess.
"""

from __future__ import annotations

import hashlib
import re
import unicodedata
from decimal import Decimal

from bs4 import BeautifulSoup
from markdownify import markdownify

from .models import (
    ContractType,
    NormalizedJob,
    PaymentMethodHint,
    PaymentType,
    RawJob,
)

# ---------------------------------------------------------------------------
# Text utils
# ---------------------------------------------------------------------------


def html_to_markdown(html: str) -> str:
    """Strip HTML, drop scripts/styles, return clean markdown."""
    soup = BeautifulSoup(html or "", "lxml")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    md = markdownify(str(soup), heading_style="ATX")
    # Collapse >2 blank lines
    md = re.sub(r"\n{3,}", "\n\n", md).strip()
    return md


def normalize_text(s: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace — for dedup keys."""
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def dedup_hash(title: str, company: str) -> str:
    return hashlib.sha256(f"{normalize_text(title)}|{normalize_text(company)}".encode()).hexdigest()[:32]


# ---------------------------------------------------------------------------
# Parsers
# ---------------------------------------------------------------------------

_US_ONLY_PATTERNS = [
    r"\bUS only\b",
    r"\bU\.S\. only\b",
    r"\bUnited States only\b",
    r"must be (authorized|eligible) to work in the U\.?S\.?",
    r"\bUS[- ]based\b",
    r"\bUSA only\b",
    r"\bW-?2\b",
    r"\bmust reside in (the )?(US|USA|United States)\b",
]

_REMOTE_ANYWHERE_PATTERNS = [
    r"\bremote,? anywhere\b",
    r"\bworldwide\b",
    r"\banywhere in the world\b",
    r"\bglobal remote\b",
    r"\bfully remote\b(?!.*\b(only|US|USA)\b)",
]

_ENTRY_LEVEL_PATTERNS = [
    r"\bjunior\b",
    r"\bentry[- ]level\b",
    r"\bno experience (required|needed)\b",
    r"\bgraduate\b",
    r"\bintern(ship)?\b",
]

_EXPERIENCE_YEARS = re.compile(r"(\d+)\+?\s*(?:years?|yrs)\b", re.IGNORECASE)
_HOURLY_RATE = re.compile(
    r"\$\s?(\d{2,4})(?:\s?[-–]\s?\$?\s?(\d{2,4}))?\s?(?:/|per\s+)?\s?(?:hr|hour)",
    re.IGNORECASE,
)
_SALARY_RATE = re.compile(
    r"\$\s?(\d{2,3})[,]?(\d{3})?(?:k|,000)?(?:\s?[-–]\s?\$?\s?(\d{2,3})[,]?(\d{3})?(?:k|,000)?)?\s?(?:/|per\s+)?\s?(?:year|yr|annum)",
    re.IGNORECASE,
)

_TIMEZONE_HINTS: dict[str, tuple[int, int]] = {
    "EU": (0, 3),
    "EMEA": (-1, 4),
    "Europe": (0, 3),
    "GMT": (-1, 3),
    "CET": (0, 2),
    "UTC": (-1, 2),
    "US East": (-5, -4),
    "US West": (-8, -7),
    "Americas": (-8, -3),
    "Latam": (-6, -3),
    "APAC": (7, 12),
    "AEST": (9, 11),
}

_SKILL_KEYWORDS: dict[str, list[str]] = {
    "nextjs": [r"\bNext\.?js\b", r"\bNextJS\b"],
    "react": [r"\bReact(?:\.js)?\b"],
    "typescript": [r"\bTypeScript\b", r"\bTS\b"],
    "python": [r"\bPython\b"],
    "postgres": [r"\bPostgres(?:QL)?\b", r"\bPSQL\b"],
    "prisma": [r"\bPrisma\b"],
    "nodejs": [r"\bNode\.?js\b"],
    "ai-ml": [r"\bLLM\b", r"\bAI/ML\b", r"\bMachine Learning\b", r"\bGPT\b", r"\bClaude\b"],
    "claude-code": [r"\bClaude Code\b"],
    "aws": [r"\bAWS\b", r"\bAmazon Web Services\b"],
    "docker": [r"\bDocker\b", r"\bcontainer(?:s|ization)?\b"],
}

_SCAM_PATTERNS = [
    (r"\bwire transfer\b", "asks about wire transfer"),
    (r"\bwestern union\b", "mentions Western Union"),
    (r"\bpay(?:ment)? upfront\b", "asks for upfront payment"),
    (r"\btraining fee\b", "training fee mentioned"),
    (r"\btelegram\s*:", "contact via Telegram username"),
    (r"\bwhatsapp\s*:", "contact via WhatsApp number"),
]

_PAYMENT_METHOD_PATTERNS: dict[PaymentMethodHint, list[str]] = {
    PaymentMethodHint.WISE: [r"\bWise\b(?!\w)", r"\bTransferWise\b"],
    PaymentMethodHint.PAYONEER: [r"\bPayoneer\b"],
    PaymentMethodHint.PAYPAL: [r"\bPayPal\b"],
    PaymentMethodHint.CRYPTO: [r"\bcrypto\b", r"\bUSDC\b", r"\bUSDT\b", r"\bBitcoin\b"],
    PaymentMethodHint.DEEL: [r"\bDeel\b"],
    PaymentMethodHint.BANK_TRANSFER: [r"\bbank transfer\b", r"\bACH\b", r"\bSEPA\b"],
}


def _any_match(text: str, patterns: list[str]) -> bool:
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)


def parse_is_us_only(text: str) -> bool:
    return _any_match(text, _US_ONLY_PATTERNS)


def parse_is_remote_anywhere(text: str) -> bool:
    return _any_match(text, _REMOTE_ANYWHERE_PATTERNS)


def parse_is_entry_level(text: str, title: str) -> bool:
    return _any_match(text, _ENTRY_LEVEL_PATTERNS) or _any_match(title, _ENTRY_LEVEL_PATTERNS)


def parse_required_years(text: str) -> int | None:
    m = _EXPERIENCE_YEARS.search(text)
    if not m:
        return None
    try:
        yrs = int(m.group(1))
        return yrs if 0 < yrs < 30 else None
    except ValueError:
        return None


def parse_hourly_range(text: str) -> tuple[Decimal | None, Decimal | None]:
    m = _HOURLY_RATE.search(text)
    if not m:
        return None, None
    low = Decimal(m.group(1))
    high = Decimal(m.group(2)) if m.group(2) else low
    if low > high:
        low, high = high, low
    return low, high


def parse_salary_range(text: str) -> tuple[Decimal | None, Decimal | None]:
    m = _SALARY_RATE.search(text)
    if not m:
        return None, None

    def _to_int(k: str | None, rest: str | None) -> int:
        if not k:
            return 0
        base = int(k)
        if rest:
            return base * 1000 + int(rest)
        # "$120k" style
        return base * 1000 if base < 1000 else base

    low = Decimal(_to_int(m.group(1), m.group(2)))
    high = Decimal(_to_int(m.group(3), m.group(4))) if m.group(3) else low
    if low > high:
        low, high = high, low
    return low, high


def parse_timezone_range(text: str) -> tuple[int | None, int | None, list[str]]:
    regions: list[str] = []
    min_off: int | None = None
    max_off: int | None = None
    for tag, (lo, hi) in _TIMEZONE_HINTS.items():
        if re.search(rf"\b{re.escape(tag)}\b", text, re.IGNORECASE):
            regions.append(tag)
            min_off = lo if min_off is None else min(min_off, lo)
            max_off = hi if max_off is None else max(max_off, hi)
    return min_off, max_off, regions


def parse_skills(text: str, title: str) -> list[str]:
    hay = f"{title}\n{text}"
    found: list[str] = []
    for slug, patterns in _SKILL_KEYWORDS.items():
        if _any_match(hay, patterns):
            found.append(slug)
    return found


def parse_scam(text: str) -> tuple[bool, list[str]]:
    reasons = [reason for pattern, reason in _SCAM_PATTERNS if re.search(pattern, text, re.IGNORECASE)]
    return bool(reasons), reasons


def parse_payment_methods(text: str) -> list[PaymentMethodHint]:
    return [
        hint
        for hint, patterns in _PAYMENT_METHOD_PATTERNS.items()
        if _any_match(text, patterns)
    ]


def parse_contract_types(text: str, title: str) -> list[ContractType]:
    hay = f"{title}\n{text}".lower()
    out: list[ContractType] = []
    if any(x in hay for x in ["contract", "contractor", "freelance"]):
        out.append(ContractType.CONTRACT)
    if "part-time" in hay or "part time" in hay:
        out.append(ContractType.PART_TIME)
    if "full-time" in hay or "full time" in hay:
        out.append(ContractType.FULL_TIME)
    if "intern" in hay:
        out.append(ContractType.INTERNSHIP)
    return out


def parse_payment_types(
    text: str, hourly_range: tuple[Decimal | None, Decimal | None],
    salary_range: tuple[Decimal | None, Decimal | None],
) -> list[PaymentType]:
    out: list[PaymentType] = []
    if hourly_range[0] is not None:
        out.append(PaymentType.HOURLY)
    if salary_range[0] is not None:
        out.append(PaymentType.SALARIED)
    lower = text.lower()
    if "equity only" in lower or "equity-only" in lower:
        out.append(PaymentType.EQUITY_ONLY)
    if "unpaid" in lower and "internship" not in lower:
        out.append(PaymentType.UNPAID)
    if "retainer" in lower:
        out.append(PaymentType.RETAINER)
    return out


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------


def normalize(raw: RawJob) -> NormalizedJob:
    description_md = html_to_markdown(raw.description_html)
    text = f"{raw.title}\n{description_md}"

    hourly = parse_hourly_range(text)
    salary = parse_salary_range(text)
    tz_min, tz_max, regions = parse_timezone_range(text)
    is_scam, scam_reasons = parse_scam(text)

    return NormalizedJob(
        source_slug=raw.source_slug,
        external_id=raw.external_id,
        source_url=raw.source_url,
        raw_payload=raw.raw_payload,
        dedup_key=dedup_hash(raw.title, raw.company_name),
        title_original=raw.title,
        title_normalized=normalize_text(raw.title),
        description_md=description_md,
        apply_url=raw.apply_url or raw.source_url,
        company_name=raw.company_name,
        company_name_normalized=normalize_text(raw.company_name),
        is_us_only=parse_is_us_only(text),
        is_remote_anywhere=parse_is_remote_anywhere(text),
        allowed_regions=regions,
        timezone_min_utc_offset=tz_min,
        timezone_max_utc_offset=tz_max,
        hourly_min_usd=hourly[0],
        hourly_max_usd=hourly[1],
        salary_min_usd=salary[0],
        salary_max_usd=salary[1],
        payment_types=parse_payment_types(text, hourly, salary),
        contract_types=parse_contract_types(text, raw.title),
        is_entry_level=parse_is_entry_level(description_md, raw.title),
        required_experience_years=parse_required_years(text),
        payment_methods_hint=parse_payment_methods(text),
        is_scam_suspected=is_scam,
        scam_reasons=scam_reasons,
        skills=parse_skills(description_md, raw.title),
        posted_at=raw.posted_at,
    )
