"""WeWorkRemotely — RSS feed.

Categories we care about:
- remote-programming-jobs
- remote-full-stack-programming-jobs
- remote-back-end-programming-jobs
- remote-front-end-programming-jobs

The RSS gives title, link, pubDate, description (HTML). Company is in the title
as "Company: Title" — we split. If splitting fails, we mark company as "Unknown"
rather than dropping the job.
"""

from __future__ import annotations

from datetime import datetime
from email.utils import parsedate_to_datetime

import feedparser
import structlog

from ..models import RawJob

log = structlog.get_logger(__name__)

FEEDS = [
    "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
]

USER_AGENT = "remote-work-radar/0.0.1 (+https://github.com/Regat1ve/remote-work-radar)"


def _parse_title(raw_title: str) -> tuple[str, str]:
    """WWR titles look like 'Company: Position title'. Split on the first colon."""
    if ":" in raw_title:
        company, _, title = raw_title.partition(":")
        return company.strip(), title.strip()
    return "Unknown", raw_title.strip()


def _parse_date(pubdate: str | None) -> datetime | None:
    if not pubdate:
        return None
    try:
        return parsedate_to_datetime(pubdate)
    except (TypeError, ValueError):
        return None


def fetch() -> list[RawJob]:
    out: list[RawJob] = []
    seen: set[str] = set()

    for url in FEEDS:
        log.info("wwr.fetching", url=url)
        feed = feedparser.parse(url, agent=USER_AGENT)
        if feed.bozo:
            log.warning("wwr.feed_error", url=url, error=str(feed.bozo_exception))
            continue

        for entry in feed.entries:
            guid = entry.get("id") or entry.get("link") or ""
            if not guid or guid in seen:
                continue
            seen.add(guid)

            company, title = _parse_title(entry.get("title", ""))
            out.append(
                RawJob(
                    source_slug="weworkremotely",
                    external_id=guid,
                    source_url=entry.get("link", ""),
                    title=title,
                    company_name=company,
                    description_html=entry.get("summary", "") or entry.get("description", ""),
                    posted_at=_parse_date(entry.get("published")),
                    apply_url=entry.get("link"),
                    raw_payload=dict(entry),
                )
            )

    log.info("wwr.done", count=len(out))
    return out
