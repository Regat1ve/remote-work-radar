"""Job source implementations.

Every source exports `fetch() -> list[RawJob]`. That is the only contract.
Errors bubble up; main.py catches and logs per source.
"""

from __future__ import annotations

from collections.abc import Callable

from ..models import RawJob
from . import hn_hiring, remoteok, weworkremotely

Fetcher = Callable[[], list[RawJob]]

REGISTRY: dict[str, Fetcher] = {
    "weworkremotely": weworkremotely.fetch,
    "remoteok": remoteok.fetch,
    "hn-who-is-hiring": hn_hiring.fetch,
}

__all__ = ["Fetcher", "REGISTRY"]
