"""The engine, exposed.

The environment computes locally so that a slider stays instant; this endpoint
is the same computation server-side, for anything that has to be authoritative —
freezing a Model Record, or an API consumer that has no frontend at all.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.catalog import build_catalog
from app.database import get_db
from app.engine import Engine, EngineError

router = APIRouter(prefix="/model", tags=["model"])


@router.post(
    "/compute",
    response_model=schemas.ModelResult,
    summary="Compute an institution",
    description=(
        "Runs the specification through the House's model and returns the sixty-month "
        "projection, the capital pools, the break-even month and the position against "
        "what the structure requires."
    ),
)
def compute(payload: schemas.ModelRequest, db: Session = Depends(get_db)) -> dict:
    catalog = build_catalog(db)

    if payload.family not in catalog["families"]:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"No family '{payload.family}'.")
    family = catalog["families"][payload.family]
    if payload.institution_type not in family["types"]:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            f"No institution type '{payload.institution_type}' in the {family['name']} family.",
        )
    if payload.jurisdiction not in catalog["jurisdictions"]:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, f"No jurisdiction '{payload.jurisdiction}'."
        )
    if payload.second and payload.second not in family["second"]["opts"]:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            f"No option '{payload.second}' for {family['second']['label'].lower()}.",
        )

    try:
        return Engine(catalog).build(
            family=payload.family,
            institution_type=payload.institution_type,
            jurisdiction=payload.jurisdiction,
            second=payload.second,
            capital=payload.capital,
            scale=payload.scale,
            selections=payload.selections,
            shocks=payload.shocks,
        )
    except EngineError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
