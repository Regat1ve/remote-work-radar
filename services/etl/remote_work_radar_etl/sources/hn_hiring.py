"""HN 'Ask HN: Who is hiring?' — monthly thread scraper.

We use the Algolia HN Search API:
1. Find the latest "Ask HN: Who is hiring?" story (or use HN_HIRING_THREAD_ID env)
2. Fetch its top-level comments via https://hn.algolia.com/api/v1/items/<id>
3. Each top-level comment is one job posting (by convention on HN)

Parsing HN comments is a lossy art. We extract:
- Company (usually first line, sometimes formatted "COMPANY | ROLE | LOCATION | HOURLY")
- Title (parsed from the "|"-separated header or the first line)
- Description (the rest as HTML)

We do NOT try to be clever if the format is off — we ingest as-is and let
normalize.py figure out geo/rate/etc from the whole body.
"""

from __future__ import annotations

import os
import re
from datetime import UTC, datetime
from typing import Any

import httpx
import structlog
from bs4 import BeautifulSoup

from ..models import RawJob

log = structlog.get_logger(__name__)

USER_AGENT = "remote-work-radar/0.0.1 (+https://github.com/Regat1ve/remote-work-radar)"
# search_by_date sorts by created_at DESC by default — the plain /search endpoint
# uses Algolia's relevance score, which does NOT put the newest hiring thread first.
ALGOLIA_SEARCH_BY_DATE = "https://hn.algolia.com/api/v1/search_by_date"
ALGOLIA_ITEM = "https://hn.algolia.com/api/v1/items/{id}"

_HEADER_LINE = re.compile(r"^([^|]+?)\s*\|\s*([^|]+?)(?:\s*\|\s*(.+))?$")


def _find_latest_thread_id(client: httpx.Client) -> int | None:
    override = os.getenv("HN_HIRING_THREAD_ID")
    if override:
        try:
            return int(override)
        except ValueError:
            log.warning("hn.bad_override", value=override)

    params = {
        "query": "Ask HN: Who is hiring",
        "tags": "story,author_whoishiring",
        "hitsPerPage": "5",
    }
    resp = client.get(ALGOLIA_SEARCH_BY_DATE, params=params)
    resp.raise_for_status()
    hits = resp.json().get("hits", [])
    if not hits:
        return None
    # search_by_date already returns newest first; take the first hit whose title
    # matches the Ask HN pattern (defensive against title-drift in matching stories).
    for h in hits:
        title = (h.get("title") or "").lower()
        if "who is hiring" in title:
            return int(h["objectID"])
    return int(hits[0]["objectID"])


def _parse_first_line(text: str) -> tuple[str, str]:
    """Best-effort split of the first comment line into (company, title).

    HN convention: 'COMPANY | ROLE | LOCATION | STACK'
    Falls back to ('Unknown', first line).

    HN API returns comment text as HTML with entities (`&#x27;` for apostrophe etc.).
    We run it through BeautifulSoup first so downstream sees plain unicode.
    """
    plain = BeautifulSoup(text or "", "lxml").get_text(separator="\n")
    first_line = plain.strip().split("\n", 1)[0].strip()
    m = _HEADER_LINE.match(first_line)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return "Unknown", first_line[:200] if first_line else "Untitled HN post"


def _walk_top_comments(node: dict[str, Any]) -> list[dict[str, Any]]:
    """Return only the direct children (top-level comments on the thread)."""
    return [c for c in node.get("children", []) if not c.get("deleted") and c.get("text")]


def fetch() -> list[RawJob]:
    with httpx.Client(
        headers={"User-Agent": USER_AGENT},
        timeout=60.0,
        transport=httpx.HTTPTransport(retries=3),
    ) as client:
        thread_id = _find_latest_thread_id(client)
        if not thread_id:
            log.warning("hn.no_thread_found")
            return []

        log.info("hn.fetching", thread_id=thread_id)
        resp = client.get(ALGOLIA_ITEM.format(id=thread_id))
        resp.raise_for_status()
        thread = resp.json()

    comments = _walk_top_comments(thread)
    log.info("hn.comments_found", count=len(comments))

    out: list[RawJob] = []
    for c in comments:
        text = c.get("text") or ""
        company, title = _parse_first_line(text)
        created_i = c.get("created_at_i")
        posted_at = datetime.fromtimestamp(int(created_i), tz=UTC) if created_i else None

        out.append(
            RawJob(
                source_slug="hn-who-is-hiring",
                external_id=str(c["id"]),
                source_url=f"https://news.ycombinator.com/item?id={c['id']}",
                title=title,
                company_name=company,
                description_html=text,
                posted_at=posted_at,
                apply_url=f"https://news.ycombinator.com/item?id={c['id']}",
                raw_payload={"thread_id": thread_id, "comment": c},
            )
        )

    log.info("hn.done", count=len(out))
    return out
