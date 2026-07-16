"""Postgres writer.

We use psycopg 3 directly (no ORM in the ETL) — much faster batch inserts,
and no Prisma runtime dependency for Python.

Schema is owned by Prisma. We just INSERT/UPDATE against tables it created.
Column names use camelCase as Prisma emits them.
"""

from __future__ import annotations

import json
import os
from collections.abc import Iterable
from contextlib import contextmanager
from datetime import datetime

import psycopg
import structlog
from psycopg.rows import dict_row
from psycopg.types.json import Json

from .models import NormalizedJob

log = structlog.get_logger(__name__)


def _database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL is not set. Copy .env.example to .env and fill it in.")
    return url


@contextmanager
def connect() -> Iterable[psycopg.Connection]:
    with psycopg.connect(_database_url(), row_factory=dict_row) as conn:
        yield conn


def _upsert_company(cur: psycopg.Cursor, name: str, name_normalized: str) -> str:
    cur.execute(
        """
        INSERT INTO companies (id, name, "nameNormalized", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, %s, %s, NOW(), NOW())
        ON CONFLICT ("nameNormalized")
            DO UPDATE SET "updatedAt" = NOW()
        RETURNING id;
        """,
        (name, name_normalized),
    )
    row = cur.fetchone()
    assert row is not None
    return row["id"]


def _source_id(cur: psycopg.Cursor, slug: str) -> str:
    cur.execute("SELECT id FROM sources WHERE slug = %s", (slug,))
    row = cur.fetchone()
    if not row:
        raise RuntimeError(f"Source '{slug}' not found. Run pnpm --filter @rwr/db exec tsx prisma/seed.ts")
    return row["id"]


def _upsert_skill(cur: psycopg.Cursor, slug: str) -> str:
    cur.execute(
        """
        INSERT INTO skills (id, slug, "displayName")
        VALUES (gen_random_uuid()::text, %s, %s)
        ON CONFLICT (slug) DO UPDATE SET "displayName" = EXCLUDED."displayName"
        RETURNING id;
        """,
        (slug, slug.replace("-", " ").title()),
    )
    row = cur.fetchone()
    assert row is not None
    return row["id"]


def _upsert_job(cur: psycopg.Cursor, j: NormalizedJob, company_id: str) -> tuple[str, bool]:
    """Insert or update the Job row. Returns (job_id, was_inserted)."""
    cur.execute(
        """
        INSERT INTO jobs (
            id, "dedupKey", "titleOriginal", "titleNormalized", "descriptionMd",
            "applyUrl", "companyId",
            "isUsOnly", "isRemoteAnywhere", "allowedRegions",
            "timezoneMinUtcOffset", "timezoneMaxUtcOffset",
            "hourlyMinUsd", "hourlyMaxUsd", "salaryMinUsd", "salaryMaxUsd",
            "paymentTypes", "contractTypes",
            "isEntryLevel", "requiredExperienceYears",
            "paymentMethodsHint",
            "isScamSuspected", "scamReasons",
            "postedAt",
            "firstSeenAt", "lastSeenAt", "isActive",
            "createdAt", "updatedAt"
        )
        VALUES (
            gen_random_uuid()::text, %s, %s, %s, %s,
            %s, %s,
            %s, %s, %s,
            %s, %s,
            %s, %s, %s, %s,
            %s::"PaymentType"[], %s::"ContractType"[],
            %s, %s,
            %s::"PaymentMethodHint"[],
            %s, %s,
            %s,
            NOW(), NOW(), TRUE,
            NOW(), NOW()
        )
        ON CONFLICT ("dedupKey") DO UPDATE SET
            "lastSeenAt" = NOW(),
            "isActive" = TRUE,
            "updatedAt" = NOW(),
            "descriptionMd" = EXCLUDED."descriptionMd",
            "applyUrl" = EXCLUDED."applyUrl",
            "isUsOnly" = EXCLUDED."isUsOnly",
            "isRemoteAnywhere" = EXCLUDED."isRemoteAnywhere",
            "allowedRegions" = EXCLUDED."allowedRegions",
            "hourlyMinUsd" = EXCLUDED."hourlyMinUsd",
            "hourlyMaxUsd" = EXCLUDED."hourlyMaxUsd"
        RETURNING id, (xmax = 0) AS inserted;
        """,
        (
            j.dedup_key, j.title_original, j.title_normalized, j.description_md,
            j.apply_url, company_id,
            j.is_us_only, j.is_remote_anywhere, j.allowed_regions,
            j.timezone_min_utc_offset, j.timezone_max_utc_offset,
            j.hourly_min_usd, j.hourly_max_usd, j.salary_min_usd, j.salary_max_usd,
            [p.value for p in j.payment_types], [c.value for c in j.contract_types],
            j.is_entry_level, j.required_experience_years,
            [m.value for m in j.payment_methods_hint],
            j.is_scam_suspected, j.scam_reasons,
            j.posted_at,
        ),
    )
    row = cur.fetchone()
    assert row is not None
    return row["id"], bool(row["inserted"])


def _upsert_job_source_ref(cur: psycopg.Cursor, job_id: str, source_id: str, j: NormalizedJob) -> None:
    cur.execute(
        """
        INSERT INTO job_source_refs (
            id, "jobId", "sourceId", "externalId", "sourceUrl", "rawSnapshot", "fetchedAt"
        )
        VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT ("sourceId", "externalId") DO UPDATE SET
            "rawSnapshot" = EXCLUDED."rawSnapshot",
            "fetchedAt" = NOW();
        """,
        (job_id, source_id, j.external_id, j.source_url, Json(j.raw_payload)),
    )


def _attach_skills(cur: psycopg.Cursor, job_id: str, skill_slugs: list[str]) -> None:
    for slug in skill_slugs:
        skill_id = _upsert_skill(cur, slug)
        cur.execute(
            """
            INSERT INTO job_skills ("jobId", "skillId")
            VALUES (%s, %s)
            ON CONFLICT ("jobId", "skillId") DO NOTHING;
            """,
            (job_id, skill_id),
        )


def write_jobs(jobs: list[NormalizedJob]) -> dict[str, int]:
    """Batch write. Returns counts of inserted/updated per source."""
    counts: dict[str, dict[str, int]] = {}

    with connect() as conn:
        with conn.cursor() as cur:
            # Cache source ids
            source_ids: dict[str, str] = {}
            for j in jobs:
                if j.source_slug not in source_ids:
                    source_ids[j.source_slug] = _source_id(cur, j.source_slug)

            for j in jobs:
                try:
                    company_id = _upsert_company(cur, j.company_name, j.company_name_normalized)
                    job_id, inserted = _upsert_job(cur, j, company_id)
                    _upsert_job_source_ref(cur, job_id, source_ids[j.source_slug], j)
                    _attach_skills(cur, job_id, j.skills)

                    bucket = counts.setdefault(j.source_slug, {"inserted": 0, "updated": 0})
                    bucket["inserted" if inserted else "updated"] += 1
                except Exception as exc:  # noqa: BLE001
                    log.warning(
                        "db.job_write_failed",
                        source=j.source_slug,
                        external_id=j.external_id,
                        error=str(exc),
                    )
                    conn.rollback()
                    continue

            conn.commit()

    summary: dict[str, int] = {}
    for src, bucket in counts.items():
        summary[f"{src}.inserted"] = bucket["inserted"]
        summary[f"{src}.updated"] = bucket["updated"]
    return summary


def mark_stale_jobs(cutoff: datetime) -> int:
    """Mark jobs whose lastSeenAt is older than cutoff as inactive."""
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE jobs SET "isActive" = FALSE, "updatedAt" = NOW() '
                'WHERE "isActive" = TRUE AND "lastSeenAt" < %s',
                (cutoff,),
            )
            n = cur.rowcount
        conn.commit()
    return n
