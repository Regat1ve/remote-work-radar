"""Pydantic models for the ETL pipeline.

RawJob   → what a source returns (source-specific, minimal cleanup)
NormalizedJob → what we write to Postgres (fully parsed geo/rate/skills)
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class PaymentType(str, Enum):
    HOURLY = "HOURLY"
    RETAINER = "RETAINER"
    FIXED = "FIXED"
    SALARIED = "SALARIED"
    EQUITY_ONLY = "EQUITY_ONLY"
    UNPAID = "UNPAID"


class ContractType(str, Enum):
    CONTRACT = "CONTRACT"
    PART_TIME = "PART_TIME"
    FULL_TIME = "FULL_TIME"
    INTERNSHIP = "INTERNSHIP"
    FREELANCE = "FREELANCE"


class PaymentMethodHint(str, Enum):
    BANK_TRANSFER = "BANK_TRANSFER"
    WISE = "WISE"
    PAYONEER = "PAYONEER"
    CRYPTO = "CRYPTO"
    PAYPAL = "PAYPAL"
    DEEL = "DEEL"
    UNKNOWN = "UNKNOWN"


class RawJob(BaseModel):
    """Minimal per-source shape. Everything else is derived in normalize.py."""

    source_slug: str
    external_id: str
    source_url: str
    title: str
    company_name: str
    description_html: str
    posted_at: datetime | None = None
    apply_url: str | None = None
    raw_payload: dict[str, Any] = Field(default_factory=dict)


class NormalizedJob(BaseModel):
    """The DB-ready shape. All fields typed as they land in Postgres."""

    # From source
    source_slug: str
    external_id: str
    source_url: str
    raw_payload: dict[str, Any]

    # Identity
    dedup_key: str
    title_original: str
    title_normalized: str
    description_md: str
    apply_url: str
    canonical_url: str | None = None

    # Company
    company_name: str
    company_name_normalized: str

    # Geo
    is_us_only: bool = False
    is_remote_anywhere: bool = False
    allowed_regions: list[str] = Field(default_factory=list)
    timezone_min_utc_offset: int | None = None
    timezone_max_utc_offset: int | None = None

    # Comp
    hourly_min_usd: Decimal | None = None
    hourly_max_usd: Decimal | None = None
    salary_min_usd: Decimal | None = None
    salary_max_usd: Decimal | None = None
    payment_types: list[PaymentType] = Field(default_factory=list)
    contract_types: list[ContractType] = Field(default_factory=list)

    # Beginner signals
    is_entry_level: bool = False
    required_experience_years: int | None = None
    has_visa_sponsorship: bool = False
    payment_methods_hint: list[PaymentMethodHint] = Field(default_factory=list)

    # Trust
    is_scam_suspected: bool = False
    scam_reasons: list[str] = Field(default_factory=list)
    is_nsfw: bool = False

    # Skills (slugs)
    skills: list[str] = Field(default_factory=list)

    # Lifecycle
    posted_at: datetime | None = None
    expires_at: datetime | None = None
