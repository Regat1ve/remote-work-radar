"""ETL entrypoint.

Usage:
    python -m remote_work_radar_etl.main --once
    python -m remote_work_radar_etl.main --loop --interval 900
    python -m remote_work_radar_etl.main --source weworkremotely --once
"""

from __future__ import annotations

import time
from datetime import UTC, datetime, timedelta

import structlog
import typer
from dotenv import load_dotenv

from .db import connect, mark_stale_jobs, write_jobs
from .models import NormalizedJob
from .normalize import normalize, repair_text
from .sources import REGISTRY

load_dotenv()
structlog.configure(processors=[structlog.processors.KeyValueRenderer(sort_keys=True)])
log = structlog.get_logger(__name__)

app = typer.Typer(add_completion=False, help="remote-work-radar ETL")


def _run_source(slug: str) -> list[NormalizedJob]:
    fetcher = REGISTRY.get(slug)
    if not fetcher:
        raise typer.BadParameter(f"Unknown source '{slug}'. Known: {list(REGISTRY)}")
    log.info("source.start", source=slug)
    try:
        raw = fetcher()
    except Exception as exc:  # noqa: BLE001
        log.error("source.failed", source=slug, error=str(exc))
        return []

    normalized: list[NormalizedJob] = []
    for r in raw:
        try:
            normalized.append(normalize(r))
        except Exception as exc:  # noqa: BLE001
            log.warning("normalize.failed", source=slug, external_id=r.external_id, error=str(exc))
    log.info("source.done", source=slug, raw=len(raw), normalized=len(normalized))
    return normalized


def _run_all() -> dict[str, int]:
    all_jobs: list[NormalizedJob] = []
    for slug in REGISTRY:
        all_jobs.extend(_run_source(slug))
    if not all_jobs:
        log.warning("etl.nothing_fetched")
        return {}
    summary = write_jobs(all_jobs)
    stale = mark_stale_jobs(datetime.now(tz=UTC) - timedelta(days=14))
    summary["stale.deactivated"] = stale
    log.info("etl.run_complete", **summary)
    return summary


@app.command()
def once(
    source: str | None = typer.Option(None, help="Run a single source by slug."),
) -> None:
    """Run once and exit."""
    if source:
        jobs = _run_source(source)
        summary = write_jobs(jobs) if jobs else {}
    else:
        summary = _run_all()
    typer.echo(summary)


@app.command()
def repair() -> None:
    """One-shot: run ftfy over every existing jobs.descriptionMd row.

    Fixes mojibake in rows we already wrote before the normalize pass had
    ftfy. Idempotent — running twice touches zero rows.
    """
    updated = 0
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT id, "descriptionMd" FROM jobs')
            rows = cur.fetchall()
        with conn.cursor() as cur:
            for row in rows:
                fixed = repair_text(row["descriptionMd"] or "")
                if fixed != (row["descriptionMd"] or ""):
                    cur.execute(
                        'UPDATE jobs SET "descriptionMd" = %s WHERE id = %s',
                        (fixed, row["id"]),
                    )
                    updated += 1
        conn.commit()
    log.info("etl.repair_complete", scanned=len(rows), updated=updated)
    typer.echo({"scanned": len(rows), "updated": updated})


@app.command()
def loop(
    interval: int = typer.Option(900, help="Seconds between runs."),
) -> None:
    """Run every N seconds until stopped."""
    while True:
        try:
            _run_all()
        except Exception as exc:  # noqa: BLE001
            log.error("etl.loop_iteration_failed", error=str(exc))
        log.info("etl.sleep", seconds=interval)
        time.sleep(interval)


if __name__ == "__main__":
    app()
