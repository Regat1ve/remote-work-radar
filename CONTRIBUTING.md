# Contributing

New job sources are the highest-value thing you can add. Everything else — parser tweaks, UI polish, docs — is welcome too.

## Adding a new job source

A source is a Python module in `services/etl/remote_work_radar_etl/sources/` that exports `fetch() -> list[RawJob]`. That is the entire contract.

1. Create `sources/your_source.py` with a `fetch()` function that returns a list of `RawJob` (see `models.py` for the shape).
2. Register it in `sources/__init__.py` — add a slug to the `REGISTRY` dict.
3. Add a matching row to `packages/db/prisma/seed.ts` so the DB knows about the source.
4. Run `pnpm --filter @rwr/db exec tsx prisma/seed.ts` to insert it.
5. Test end-to-end: `python -m remote_work_radar_etl.main once --source your-source`.
6. Add a test in `services/etl/tests/` if the parser has non-trivial logic.

**Rules for a good source:**

- Always populate `raw_payload` with the original API/RSS payload. Future parser fixes can replay against it without re-fetching.
- Do not try to be clever if the format is off. Ingest as-is and let `normalize.py` derive geo/rate/skills from the whole body.
- Set a descriptive `User-Agent` (see existing sources for the pattern).
- Handle rate limits and transient failures — bubble the exception, `main.py` logs and continues.

## Parser changes

Every parse function in `normalize.py` returns `None` on no match. **Never guess.** If the regex is uncertain, add a test case that pins the behaviour rather than tuning the pattern to pass one example.

Run tests before you push:

```bash
cd services/etl
python -m pytest tests/
```

## MCP server changes

MCP tools live in `apps/mcp/src/index.ts`. If you add a tool:

1. Define its input schema with zod at the top of the file.
2. Register it in both `ListToolsRequestSchema` (name, description, JSON Schema) and `CallToolRequestSchema` (dispatch case).
3. Always wrap the result with `jsonToolResult(payload, help)` — the `_help` string is what the MCP client renders back to the user.
4. Rebuild: `pnpm --filter @rwr/mcp build`.
5. Add a line to `apps/mcp/README.md`.

MCP tools should be read-only against the shared Postgres. Anything writing per-user data (saved jobs, applied) needs auth — that's a separate PR.

## Web / DB changes

- Prisma: never `db push`. Always `prisma migrate dev` in dev, `prisma migrate deploy` everywhere else.
- No feature flags in pre-launch. Delete-and-rebuild is cheaper than infrastructure to switch shapes.
- Server-side data reads live in `apps/web/src/lib/jobs-query.ts`. Add filters there, not in the client.

## Commit style

Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`). Explain the *why* in the body, not the what — the diff shows the what.

## License

By contributing, you agree your code is released under MIT.
