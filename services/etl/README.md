# remote-work-radar-etl

Python ETL that pulls remote job postings from WeWorkRemotely, RemoteOK, and HN "Who is hiring?" and writes them to Postgres.

## Install

```bash
cd services/etl
python -m venv .venv
.venv/Scripts/activate      # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -e ".[dev]"
```

## Run

Set `DATABASE_URL` in the repo-root `.env` (see `.env.example`), then:

```bash
# Once
python -m remote_work_radar_etl.main once

# Only one source
python -m remote_work_radar_etl.main once --source weworkremotely

# Loop every 15 min
python -m remote_work_radar_etl.main loop --interval 900
```

## Add a new source

1. Create `remote_work_radar_etl/sources/<slug>.py` exporting `fetch() -> list[RawJob]`.
2. Register it in `sources/__init__.py`.
3. Seed the `sources` table with a matching `slug` (see `packages/db/prisma/seed.ts`).

Every source function is standalone — no shared state, no retry logic in the source itself (retries live in the HTTP client transport).

## Design rules

See root `CLAUDE.md`. In short:
- Every source stores its raw payload as JSONB in `job_source_refs.rawSnapshot`.
- Normalization decisions live in `normalize.py`, not in individual sources.
- Dedup is by `dedupKey = sha256(title_norm + company_norm)` — same job on WWR and RemoteOK is one Job row with two `JobSourceRef` rows.
