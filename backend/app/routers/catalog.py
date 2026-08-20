"""The catalog — the House's reference data."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.catalog import build_catalog
from app.database import get_db

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get(
    "",
    response_model=schemas.CatalogOut,
    summary="The whole catalog",
    description=(
        "Coefficients, jurisdictions, the four families with their institution types, "
        "second determinations and nine layers, the stress scenarios, the passage events, "
        "the six gates and the Vestibule's document templates — in one response, in the "
        "shape the environment renders from."
    ),
)
def get_catalog(db: Session = Depends(get_db)) -> dict:
    catalog = build_catalog(db)
    if not catalog["families"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The catalog has not been seeded. Run `python -m app.seed`.",
        )
    return catalog


@router.get(
    "/coefficients",
    response_model=schemas.CoefficientRegistry,
    summary="The coefficient registry",
    description="Every figure that reaches the screen passes through one of these rows.",
)
def get_coefficients(db: Session = Depends(get_db)) -> dict:
    return build_catalog(db)["coefficients"]


@router.get(
    "/jurisdictions",
    response_model=dict[str, schemas.JurisdictionOut],
    summary="Jurisdictions",
)
def get_jurisdictions(db: Session = Depends(get_db)) -> dict:
    return build_catalog(db)["jurisdictions"]


@router.get(
    "/families",
    response_model=dict[str, schemas.FamilyOut],
    summary="The four families",
    description="Each carries its own institution types, layers, second determination and capital pools.",
)
def get_families(db: Session = Depends(get_db)) -> dict:
    return build_catalog(db)["families"]


@router.get(
    "/families/{key}",
    response_model=schemas.FamilyOut,
    summary="One family",
)
def get_family(key: str, db: Session = Depends(get_db)) -> dict:
    families = build_catalog(db)["families"]
    if key not in families:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No family '{key}'.")
    return families[key]


@router.get(
    "/scenarios",
    response_model=list[schemas.ScenarioOut],
    summary="Stress scenarios",
)
def get_scenarios(db: Session = Depends(get_db)) -> list:
    return build_catalog(db)["scenarios"]


@router.get(
    "/events",
    response_model=list[schemas.PassageEventOut],
    summary="Passage events",
    description="The matters that arise at each gate, with the House's view and the choices open.",
)
def get_events(gate: int | None = None, db: Session = Depends(get_db)) -> list:
    stmt = select(models.PassageEvent).order_by(models.PassageEvent.position)
    if gate is not None:
        stmt = stmt.where(models.PassageEvent.gate == gate)
    return [
        {"id": e.key, "gate": e.gate, "t": e.title, "b": e.body, "v": e.house_view, "c": e.choices}
        for e in db.scalars(stmt).all()
    ]


@router.get(
    "/gates",
    response_model=list[list[str]],
    summary="The six gates",
)
def get_gates(db: Session = Depends(get_db)) -> list:
    return build_catalog(db)["gates"]
