"""RemoteOK — public JSON API.

https://remoteok.com/api returns a list where the first entry is a legal notice,
and the rest are jobs. We skip the notice.

Each job has: id, slug, epoch, date, company, company_logo, position, tags,
description, location, salary_min, salary_max, apply_url, url.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import httpx
import structlog

from ..models import RawJob

log = structlog.get_logger(__name__)

API_URL = "https://remoteok.com/api"
USER_AGENT = "remote-work-radar/0.0.1 (+https://github.com/Regat1ve/remote-work-radar)"


def _to_datetime(epoch: Any) -> datetime | None:
    try:
        return datetime.fromtimestamp(int(epoch), tz=UTC)
    except (TypeError, ValueError):
        return None


def fetch() -> list[RawJob]:
    log.info("remoteok.fetching", url=API_URL)
    with httpx.Client(
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        timeout=30.0,
        transport=httpx.HTTPTransport(retries=3),
    ) as client:
        resp = client.get(API_URL)
        resp.raise_for_status()
        data: list[dict[str, Any]] = resp.json()

    # First element is a legal notice (has "legal" key), skip anything without "id".
    jobs = [j for j in data if isinstance(j, dict) and j.get("id") and j.get("position")]

    out: list[RawJob] = []
    for j in jobs:
        job_id = str(j["id"])
        out.append(
            RawJob(
                source_slug="remoteok",
                external_id=job_id,
                source_url=j.get("url") or f"https://remoteok.com/remote-jobs/{j.get('slug', job_id)}",
                title=str(j.get("position", "")),
                company_name=str(j.get("company", "Unknown")),
                description_html=str(j.get("description", "")),
                posted_at=_to_datetime(j.get("epoch")),
                apply_url=j.get("apply_url") or j.get("url"),
                raw_payload=j,
            )
        )

    log.info("remoteok.done", count=len(out))
    return out
