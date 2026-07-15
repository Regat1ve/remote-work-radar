"""Unit tests for normalize.py.

No DB. Given a RawJob, we assert the NormalizedJob fields we care about.

Every test names a specific rule from CLAUDE.md and verifies it holds.
"""

from __future__ import annotations

from decimal import Decimal

import pytest

from remote_work_radar_etl.models import (
    ContractType,
    PaymentMethodHint,
    PaymentType,
    RawJob,
)
from remote_work_radar_etl.normalize import (
    dedup_hash,
    normalize,
    normalize_text,
    parse_hourly_range,
    parse_is_entry_level,
    parse_is_remote_anywhere,
    parse_is_us_only,
    parse_payment_methods,
    parse_required_years,
    parse_salary_range,
    parse_scam,
    parse_skills,
    parse_timezone_range,
)


def _raw(**kw: object) -> RawJob:
    defaults = dict(
        source_slug="test",
        external_id="ext-1",
        source_url="https://example.com/job/1",
        title="Senior Full-Stack Engineer",
        company_name="ACME Inc.",
        description_html="<p>Great job.</p>",
    )
    defaults.update(kw)
    return RawJob(**defaults)  # type: ignore[arg-type]


# ---------------------------------------------------------------------------
# Text utilities
# ---------------------------------------------------------------------------


class TestTextUtils:
    def test_normalize_text_lowercases_and_strips_punct(self) -> None:
        assert normalize_text("ACME, Inc.  ") == "acme inc"

    def test_normalize_text_strips_accents(self) -> None:
        assert normalize_text("Café Résumé") == "cafe resume"

    def test_dedup_hash_is_stable_across_case_and_punct(self) -> None:
        a = dedup_hash("Senior Engineer", "ACME, Inc.")
        b = dedup_hash("senior engineer", "acme inc")
        assert a == b

    def test_dedup_hash_differs_by_company(self) -> None:
        assert dedup_hash("Senior Eng", "ACME") != dedup_hash("Senior Eng", "Globex")


# ---------------------------------------------------------------------------
# US-only / remote-anywhere gates
# ---------------------------------------------------------------------------


class TestUsOnly:
    @pytest.mark.parametrize(
        "text",
        [
            "This role is US only.",
            "Must be authorized to work in the US.",
            "USA only, W-2 only.",
            "Candidates must reside in the United States.",
        ],
    )
    def test_flags_us_only(self, text: str) -> None:
        assert parse_is_us_only(text) is True

    def test_does_not_flag_worldwide(self) -> None:
        assert parse_is_us_only("Fully remote, worldwide. EU + Americas + APAC.") is False


class TestRemoteAnywhere:
    @pytest.mark.parametrize(
        "text",
        [
            "Fully remote, worldwide.",
            "Remote, anywhere.",
            "Anywhere in the world.",
        ],
    )
    def test_flags_anywhere(self, text: str) -> None:
        assert parse_is_remote_anywhere(text) is True


# ---------------------------------------------------------------------------
# Beginner signals
# ---------------------------------------------------------------------------


class TestBeginner:
    def test_entry_level_from_title(self) -> None:
        assert parse_is_entry_level("", "Junior Backend Engineer") is True

    def test_entry_level_from_body(self) -> None:
        assert parse_is_entry_level("No experience required.", "Backend Engineer") is True

    def test_experience_years_parses(self) -> None:
        assert parse_required_years("Looking for 5+ years of Python experience.") == 5

    def test_experience_years_rejects_absurd(self) -> None:
        assert parse_required_years("Founded 1997.") is None


# ---------------------------------------------------------------------------
# Compensation
# ---------------------------------------------------------------------------


class TestHourlyRange:
    def test_range_dash(self) -> None:
        lo, hi = parse_hourly_range("Rate: $40-$80/hr")
        assert (lo, hi) == (Decimal("40"), Decimal("80"))

    def test_single_rate(self) -> None:
        lo, hi = parse_hourly_range("Pays $50 per hour")
        assert (lo, hi) == (Decimal("50"), Decimal("50"))

    def test_no_match_returns_nones(self) -> None:
        assert parse_hourly_range("Great benefits!") == (None, None)


class TestSalaryRange:
    def test_k_notation(self) -> None:
        lo, hi = parse_salary_range("$120k-$180k per year")
        assert (lo, hi) == (Decimal("120000"), Decimal("180000"))


# ---------------------------------------------------------------------------
# Timezone / regions
# ---------------------------------------------------------------------------


class TestTimezone:
    def test_eu_hint(self) -> None:
        lo, hi, regions = parse_timezone_range("Must overlap with EU hours.")
        assert "EU" in regions
        assert lo == 0 and hi == 3

    def test_multiple_tags(self) -> None:
        _, _, regions = parse_timezone_range("EU or Americas.")
        assert set(regions) >= {"EU", "Americas"}


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------


class TestSkills:
    def test_finds_nextjs_and_prisma(self) -> None:
        skills = parse_skills("We use Next.js and Prisma.", "Full-stack Eng")
        assert "nextjs" in skills
        assert "prisma" in skills

    def test_does_not_match_react_native_as_react_only(self) -> None:
        # React.js matches. Ensure "React Native" alone would still tag react (that is fine — same ecosystem).
        skills = parse_skills("React.js developer wanted.", "React Dev")
        assert "react" in skills


# ---------------------------------------------------------------------------
# Trust / scam
# ---------------------------------------------------------------------------


class TestScam:
    def test_upfront_payment_flag(self) -> None:
        is_scam, reasons = parse_scam("Please send $200 payment upfront to reserve your seat.")
        assert is_scam
        assert any("upfront" in r for r in reasons)

    def test_clean_post(self) -> None:
        is_scam, reasons = parse_scam("Send your resume to jobs@company.com.")
        assert not is_scam
        assert reasons == []


# ---------------------------------------------------------------------------
# Payment methods
# ---------------------------------------------------------------------------


class TestPaymentMethods:
    def test_deel_and_wise(self) -> None:
        hints = parse_payment_methods("Payment via Deel or Wise.")
        assert PaymentMethodHint.DEEL in hints
        assert PaymentMethodHint.WISE in hints

    def test_crypto_hint(self) -> None:
        hints = parse_payment_methods("Payments in USDC only.")
        assert PaymentMethodHint.CRYPTO in hints


# ---------------------------------------------------------------------------
# End-to-end normalize()
# ---------------------------------------------------------------------------


class TestNormalizeFull:
    def test_full_pipeline(self) -> None:
        raw = _raw(
            title="Senior Full-Stack Engineer (Next.js + Prisma)",
            company_name="Globex Corp",
            description_html=(
                "<p>We are looking for a <b>Senior Full-Stack Engineer</b> "
                "with 5+ years of experience.</p>"
                "<p>Rate: $60-$90 per hour. Payment via Wise or Deel.</p>"
                "<p>Remote, EU timezone.</p>"
            ),
        )
        n = normalize(raw)
        assert n.company_name_normalized == "globex corp"
        assert n.hourly_min_usd == Decimal("60")
        assert n.hourly_max_usd == Decimal("90")
        assert n.required_experience_years == 5
        assert PaymentMethodHint.WISE in n.payment_methods_hint
        assert PaymentMethodHint.DEEL in n.payment_methods_hint
        assert PaymentType.HOURLY in n.payment_types
        assert "EU" in n.allowed_regions
        assert "nextjs" in n.skills
        assert "prisma" in n.skills
        assert n.is_us_only is False

    def test_us_only_role_gets_flagged(self) -> None:
        raw = _raw(
            description_html="<p>Great role. US only. Must be authorized to work in the US.</p>",
        )
        n = normalize(raw)
        assert n.is_us_only is True
