"""The Mandate Room — the register of determinations.

Nothing is deleted from the register and nothing is amended. A determination
later reversed is recorded again, so both dates remain visible; that is why
there is no PUT or DELETE here.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/mandate", tags=["mandate"])


@router.post(
    "/determinations",
    response_model=schemas.Receipt,
    status_code=status.HTTP_201_CREATED,
    summary="Record a determination",
)
def record_determination(
    payload: schemas.DeterminationIn, db: Session = Depends(get_db)
) -> schemas.Receipt:
    count = db.scalar(select(func.count()).select_from(models.Determination)) or 0
    determination = models.Determination(
        reference=f"DR-{count + 1:04d}",
        session_token=payload.session_token,
        decision_id=payload.decision_id,
        matter=payload.matter,
        outcome=payload.outcome,
    )
    db.add(determination)
    db.commit()
    db.refresh(determination)

    return schemas.Receipt(
        reference=determination.reference,
        received_at=determination.created_at or datetime.now(timezone.utc),
        status="recorded",
        message=(
            f"{payload.decision_id} is recorded in a register that cannot be amended. "
            "A determination later reversed appears twice, with both dates."
        ),
    )


@router.get(
    "/determinations",
    response_model=list[schemas.DeterminationOut],
    summary="The register of determinations",
)
def list_determinations(
    session_token: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[models.Determination]:
    stmt = select(models.Determination).order_by(models.Determination.created_at.desc()).limit(limit)
    if session_token:
        stmt = stmt.where(models.Determination.session_token == session_token)
    return list(db.scalars(stmt).all())
