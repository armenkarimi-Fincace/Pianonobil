"""Pydantic schemas — the API's contract with the frontend.

The catalog schemas use the same short field names as the original build
(`n`, `v`, `k`, `mo`, `tn` …) rather than renaming them. The frontend's
`Catalog` type mirrors these one for one, so serving them unchanged keeps the
two ends in step and keeps every figure traceable back to the source model.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


#: Several fields are legitimately named `model_*` — they describe the House's
#: financial model, not Pydantic's. Opting out of the protected namespace keeps
#: those names rather than renaming domain vocabulary to suit the library.
NO_PROTECTED_NAMESPACES = ConfigDict(protected_namespaces=())


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())


# ---------------------------------------------------------------------------
# Catalog
# ---------------------------------------------------------------------------


class CoefficientRow(BaseModel):
    k: str
    v: float
    u: str
    src: str
    ok: bool


class CoefficientRegistry(BaseModel):
    version: str
    owner: str
    rows: list[CoefficientRow]


class JurisdictionOut(BaseModel):
    key: str
    n: str
    tier: Literal["onshore", "mid", "offshore", "none"]
    tn: str
    lic: str
    cap: str | None
    mo: int
    note: str


class InstitutionTypeOut(BaseModel):
    key: str
    n: str
    default: float = Field(alias="def")
    yield_rate: float = Field(alias="yield")
    liq: float
    note: str

    model_config = ConfigDict(populate_by_name=True)


class SecondOptionOut(BaseModel):
    key: str
    n: str
    mult: float
    why: str


class SecondDeterminationOut(BaseModel):
    label: str
    key: str
    opts: dict[str, SecondOptionOut]


class LayerOptionOut(BaseModel):
    id: str
    name: str
    capex: float
    opex: float
    months: int
    capacity: float
    ramp: float
    why: str
    requires: str | None


class LayerOut(BaseModel):
    key: str
    name: str
    by: Literal["House", "Procured", "Managed"]
    q: str
    options: list[LayerOptionOut]


class FamilyOut(BaseModel):
    key: str
    name: str
    blurb: str
    unit: str
    u: str
    min: float
    max: float
    step: float
    types: dict[str, InstitutionTypeOut]
    second: SecondDeterminationOut
    pools: list[str]
    poolNote: list[str]
    layers: list[LayerOut]


class ScenarioOut(BaseModel):
    k: str
    n: str
    d: str


class EventChoiceOut(BaseModel):
    t: str
    o: str
    m: int = 0
    x: float = 0
    cap: float | None = None
    ramp: float | None = None
    opex: float | None = None
    inject: float | None = None


class PassageEventOut(BaseModel):
    id: str
    gate: int
    t: str
    b: str
    v: str
    c: list[EventChoiceOut]


class DocumentTemplateOut(BaseModel):
    n: str
    d: str
    k: Literal["core", "jur"]


class CatalogOut(BaseModel):
    """Everything the environment needs to render, in one response."""

    coefficients: CoefficientRegistry
    jurisdictions: dict[str, JurisdictionOut]
    families: dict[str, FamilyOut]
    scenarios: list[ScenarioOut]
    events: list[PassageEventOut]
    #: [reference, subject, criteria]
    gates: list[list[str]]
    documentTemplates: dict[str, list[DocumentTemplateOut]]


# ---------------------------------------------------------------------------
# The engine
# ---------------------------------------------------------------------------


class ModelRequest(BaseModel):
    """The specification to compute. Mirrors the state the Model Room holds."""

    family: str
    institution_type: str
    jurisdiction: str
    second: str | None = None
    #: Commitment in USD millions.
    capital: float = 8
    #: Null uses the institution type's default.
    scale: float | None = None
    #: layer key -> option id
    selections: dict[str, str] = Field(default_factory=dict)
    #: scenario keys to apply
    shocks: list[str] = Field(default_factory=list)


class SpecLine(BaseModel):
    line: str
    by: str
    capex: float
    opex: float


class PoolOut(BaseModel):
    n: str
    v: float
    note: str
    held: bool
    share: int
    drawn: int


class YearOut(BaseModel):
    y: int
    rev: float
    cost: float
    res: float
    cum: float


class ModelResult(BaseModel):
    """What the engine produces. The same figures the Model Room renders."""

    model_config = NO_PROTECTED_NAMESPACES

    scale: float
    second_multiplier: float
    lines: list[SpecLine]
    capex: float
    house_capex: float
    vendor_capex: float
    opex_monthly: float
    licence_months: int
    go_live_month: int
    steady_revenue: float
    revenue: list[float]
    cost: list[float]
    cumulative: list[float]
    break_even_month: int
    pools: list[PoolOut]
    required: float
    committed: float
    gap: float
    capacity: float
    ramp: float
    year: list[YearOut]
    model_version: str


# ---------------------------------------------------------------------------
# The record
# ---------------------------------------------------------------------------


class SessionIn(BaseModel):
    state: dict[str, Any] = Field(default_factory=dict)


class SessionOut(BaseModel):
    token: str
    state: dict[str, Any]
    updated_at: datetime


class RequirementsIn(BaseModel):
    model_config = NO_PROTECTED_NAMESPACES

    session_token: str | None = None
    party: str | None = None
    path: str | None = None
    family: str | None = None
    institution_type: str | None = None
    jurisdiction: str | None = None
    carried_from: str | None = None
    answers: dict[str, str] = Field(default_factory=dict)
    documents_ready: int = 0
    documents_total: int = 0
    model_snapshot: dict[str, Any] | None = None


class EnquiryIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    organisation: str | None = Field(default=None, max_length=255)
    message: str = Field(min_length=1)
    session_token: str | None = None


class DeterminationIn(BaseModel):
    session_token: str | None = None
    decision_id: str = Field(min_length=1, max_length=32)
    matter: str = Field(min_length=1, max_length=512)
    outcome: str = Field(min_length=1, max_length=512)


class Receipt(BaseModel):
    """What the House gives back when something is lodged with it."""

    reference: str
    received_at: datetime
    status: str
    message: str


class RequirementsOut(ORMModel):
    reference: str
    party: str | None
    path: str | None
    family: str | None
    institution_type: str | None
    jurisdiction: str | None
    answers: dict[str, Any]
    documents_ready: int
    documents_total: int
    status: str
    created_at: datetime


class DeterminationOut(ORMModel):
    reference: str
    decision_id: str
    matter: str
    outcome: str
    created_at: datetime
