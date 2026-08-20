"""SQLAlchemy models.

Two groups of tables live here.

*The catalog* — coefficients, jurisdictions, families, institution types,
layers, layer options, scenarios, passage events and gates — is the House's
reference data. It is seeded from `app.seed_data` and served to the frontend by
`GET /api/v1/catalog`. Changing a coefficient here changes every figure the
environment renders, which is the point of holding it in one place.

*The record* — sessions, requirement registers, enquiries and determinations —
is what a principal produces while walking the environment.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> str:
    return uuid.uuid4().hex


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


# ---------------------------------------------------------------------------
# The catalog
# ---------------------------------------------------------------------------


class Coefficient(Base, TimestampMixin):
    """One row of the coefficient registry.

    `validated` is the difference between a figure the House will defend and an
    estimate awaiting a signed source; the environment states the count of
    unvalidated inputs on every screen, so it must be stored, not inferred.
    """

    __tablename__ = "coefficients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(16), nullable=False, default="USD")
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    validated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    model_version: Mapped[str] = mapped_column(String(32), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class Jurisdiction(Base, TimestampMixin):
    """Where an institution may sit, and what that standing costs it."""

    __tablename__ = "jurisdictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    tier: Mapped[str] = mapped_column(String(16), nullable=False)
    tier_name: Mapped[str] = mapped_column(String(64), nullable=False)
    licence_coefficient: Mapped[str] = mapped_column(String(64), nullable=False)
    capital_coefficient: Mapped[str | None] = mapped_column(String(64), nullable=True)
    months_to_permission: Mapped[int] = mapped_column(Integer, nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class Family(Base, TimestampMixin):
    """One of the four families. Nothing transfers between them."""

    __tablename__ = "families"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(16), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    blurb: Mapped[str] = mapped_column(Text, nullable=False)
    unit: Mapped[str] = mapped_column(String(64), nullable=False)
    unit_short: Mapped[str] = mapped_column(String(16), nullable=False)
    scale_min: Mapped[float] = mapped_column(Float, nullable=False)
    scale_max: Mapped[float] = mapped_column(Float, nullable=False)
    scale_step: Mapped[float] = mapped_column(Float, nullable=False)
    second_label: Mapped[str] = mapped_column(String(128), nullable=False)
    second_key: Mapped[str] = mapped_column(String(32), nullable=False)
    pools: Mapped[list] = mapped_column(JSONB, nullable=False)
    pool_notes: Mapped[list] = mapped_column(JSONB, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    types: Mapped[list["InstitutionType"]] = relationship(
        back_populates="family", cascade="all, delete-orphan", order_by="InstitutionType.position"
    )
    second_options: Mapped[list["SecondOption"]] = relationship(
        back_populates="family", cascade="all, delete-orphan", order_by="SecondOption.position"
    )
    layers: Mapped[list["Layer"]] = relationship(
        back_populates="family", cascade="all, delete-orphan", order_by="Layer.position"
    )


class InstitutionType(Base, TimestampMixin):
    """What is being built, within a family."""

    __tablename__ = "institution_types"
    __table_args__ = (UniqueConstraint("family_id", "key", name="uq_institution_type_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    family_id: Mapped[int] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), nullable=False)
    key: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    default_scale: Mapped[float] = mapped_column(Float, nullable=False)
    yield_rate: Mapped[float] = mapped_column(Float, nullable=False)
    liquidity_ratio: Mapped[float] = mapped_column(Float, nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    family: Mapped[Family] = relationship(back_populates="types")


class SecondOption(Base, TimestampMixin):
    """The family's second determination — how it carries risk, is paid, and so on."""

    __tablename__ = "second_options"
    __table_args__ = (UniqueConstraint("family_id", "key", name="uq_second_option_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    family_id: Mapped[int] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), nullable=False)
    key: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    multiplier: Mapped[float] = mapped_column(Float, nullable=False)
    why: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    family: Mapped[Family] = relationship(back_populates="second_options")


class Layer(Base, TimestampMixin):
    """One of the nine layers of an institution, and who delivers it."""

    __tablename__ = "layers"
    __table_args__ = (UniqueConstraint("family_id", "key", name="uq_layer_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    family_id: Mapped[int] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), nullable=False)
    key: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    delivered_by: Mapped[str] = mapped_column(String(16), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    family: Mapped[Family] = relationship(back_populates="layers")
    options: Mapped[list["LayerOption"]] = relationship(
        back_populates="layer", cascade="all, delete-orphan", order_by="LayerOption.position"
    )


class LayerOption(Base, TimestampMixin):
    """A configuration of a layer, with its cost, time, capacity and ramp effect."""

    __tablename__ = "layer_options"
    __table_args__ = (UniqueConstraint("layer_id", "key", name="uq_layer_option_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    layer_id: Mapped[int] = mapped_column(ForeignKey("layers.id", ondelete="CASCADE"), nullable=False)
    key: Mapped[str] = mapped_column(String(8), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    capex: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    opex: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    months: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    capacity: Mapped[float] = mapped_column(Float, nullable=False, default=1)
    ramp: Mapped[float] = mapped_column(Float, nullable=False, default=1)
    why: Mapped[str] = mapped_column(Text, nullable=False)
    #: 'onshore' or 'fund' — a precondition that closes this line until met.
    requires: Mapped[str | None] = mapped_column(String(16), nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    layer: Mapped[Layer] = relationship(back_populates="options")


class Scenario(Base, TimestampMixin):
    """A shock that can be applied in The Stress Table."""

    __tablename__ = "scenarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(16), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class Gate(Base, TimestampMixin):
    """One of the six gates of the passage."""

    __tablename__ = "gates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    reference: Mapped[str] = mapped_column(String(32), nullable=False)
    subject: Mapped[str] = mapped_column(String(128), nullable=False)
    criteria: Mapped[str] = mapped_column(Text, nullable=False)


class PassageEvent(Base, TimestampMixin):
    """A matter that arises at a gate, with the House's view and the choices open."""

    __tablename__ = "passage_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(16), unique=True, nullable=False, index=True)
    gate: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    house_view: Mapped[str] = mapped_column(Text, nullable=False)
    #: [{t, o, m, x, cap?, ramp?, opex?, inject?}] — kept as one document because
    #: the effects vary by choice and are only ever read as a whole.
    choices: Mapped[list] = mapped_column(JSONB, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DocumentTemplate(Base, TimestampMixin):
    """One item of the Vestibule's document pack.

    `set_key` is either `party_<legal form>` or `jur_<tier>`; the pack a
    principal sees is their party set followed by their jurisdiction's tier set.
    """

    __tablename__ = "document_templates"
    __table_args__ = (UniqueConstraint("set_key", "position", name="uq_document_template_position"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    set_key: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    detail: Mapped[str] = mapped_column(Text, nullable=False)
    kind: Mapped[str] = mapped_column(String(8), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


# ---------------------------------------------------------------------------
# The record
# ---------------------------------------------------------------------------


class WalkSession(Base, TimestampMixin):
    """A principal's walk through the environment, so a reload does not lose it.

    The state is stored as one JSON document deliberately: it is written on
    every determination, read only as a whole, and its shape is owned by the
    frontend. Normalising it would buy nothing and would couple the two.
    """

    __tablename__ = "walk_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    token: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True, default=_uuid)
    state: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)


class RequirementsRegister(Base, TimestampMixin):
    """A lodged Requirements Register.

    This is what the Vestibule's form produces. It commits the principal to
    nothing, and it is read by a named senior person before anything is priced.
    """

    __tablename__ = "requirements_registers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    reference: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    session_token: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)

    party: Mapped[str | None] = mapped_column(String(32), nullable=True)
    path: Mapped[str | None] = mapped_column(String(32), nullable=True)
    family: Mapped[str | None] = mapped_column(String(16), nullable=True)
    institution_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    jurisdiction: Mapped[str | None] = mapped_column(String(32), nullable=True)
    carried_from: Mapped[str | None] = mapped_column(String(8), nullable=True)

    answers: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    documents_ready: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    documents_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    model_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    status: Mapped[str] = mapped_column(String(32), nullable=False, default="under_consideration")


class Enquiry(Base, TimestampMixin):
    """A general enquiry addressed to the House."""

    __tablename__ = "enquiries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    reference: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    session_token: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    organisation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="received")


class Determination(Base, TimestampMixin):
    """A determination recorded in the Mandate Room.

    The register cannot be amended. A determination later reversed is written
    again rather than edited, so both dates remain visible — which is why there
    is no update endpoint for this table.
    """

    __tablename__ = "determinations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    reference: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    session_token: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    decision_id: Mapped[str] = mapped_column(String(32), nullable=False)
    matter: Mapped[str] = mapped_column(String(512), nullable=False)
    outcome: Mapped[str] = mapped_column(String(512), nullable=False)
