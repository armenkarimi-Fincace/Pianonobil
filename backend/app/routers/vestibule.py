"""The Vestibule — identity, the document pack, and the Requirements Register."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models, schemas
from app.catalog import build_catalog
from app.database import get_db

router = APIRouter(prefix="/vestibule", tags=["vestibule"])


@router.get(
    "/document-pack",
    response_model=list[schemas.DocumentTemplateOut],
    summary="The document pack",
    description=(
        "Generated from who is engaging and from the jurisdiction — not from a fixed form. "
        "Every item has a reason the House will state in writing if asked."
    ),
)
def document_pack(
    party: str = Query(description="individual, company, newco or office"),
    jurisdiction: str | None = Query(default=None, description="A jurisdiction key, e.g. adgm"),
    db: Session = Depends(get_db),
) -> list[dict]:
    catalog = build_catalog(db)
    templates = catalog["documentTemplates"]

    core_key = f"party_{party}"
    if core_key not in templates:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"No legal form '{party}'.")

    jur = catalog["jurisdictions"].get(jurisdiction or "adgm") or catalog["jurisdictions"].get("adgm")
    tier = jur["tier"] if jur else "none"
    return templates[core_key] + templates.get(f"jur_{tier}", [])


def _reference(db: Session, prefix: str, model, column) -> str:
    """Sequential, human-quotable references — RR-0001, XC-E-0001."""
    count = db.scalar(select(func.count()).select_from(model)) or 0
    return f"{prefix}-{count + 1:04d}"


@router.post(
    "/requirements",
    response_model=schemas.Receipt,
    status_code=status.HTTP_201_CREATED,
    summary="Lodge the Requirements Register",
    description=(
        "The register commits the principal to nothing. It is stored for a named senior "
        "person to read, and no price, total or automatic scope is produced from it."
    ),
)
def lodge_requirements(
    payload: schemas.RequirementsIn, db: Session = Depends(get_db)
) -> schemas.Receipt:
    reference = _reference(db, "RR", models.RequirementsRegister, None)
    register = models.RequirementsRegister(
        reference=reference,
        session_token=payload.session_token,
        party=payload.party,
        path=payload.path,
        family=payload.family,
        institution_type=payload.institution_type,
        jurisdiction=payload.jurisdiction,
        carried_from=payload.carried_from,
        answers=payload.answers,
        documents_ready=payload.documents_ready,
        documents_total=payload.documents_total,
        model_snapshot=payload.model_snapshot,
    )
    db.add(register)
    db.commit()
    db.refresh(register)

    return schemas.Receipt(
        reference=register.reference,
        received_at=register.created_at or datetime.now(timezone.utc),
        status=register.status,
        message=(
            "The register is lodged. A named senior person reads it before responding, "
            "and a written Response is issued by a date the House states in advance."
        ),
    )


@router.get(
    "/requirements/{reference}",
    response_model=schemas.RequirementsOut,
    summary="Read a lodged register",
)
def read_requirements(reference: str, db: Session = Depends(get_db)) -> models.RequirementsRegister:
    register = db.scalar(
        select(models.RequirementsRegister).where(models.RequirementsRegister.reference == reference)
    )
    if register is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No register with that reference.")
    return register


@router.get(
    "/requirements",
    response_model=list[schemas.RequirementsOut],
    summary="List lodged registers",
)
def list_requirements(
    limit: int = Query(default=50, ge=1, le=200), db: Session = Depends(get_db)
) -> list[models.RequirementsRegister]:
    return list(
        db.scalars(
            select(models.RequirementsRegister)
            .order_by(models.RequirementsRegister.created_at.desc())
            .limit(limit)
        ).all()
    )
