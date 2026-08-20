"""Enquiries addressed to the House."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/enquiries", tags=["enquiries"])


@router.post(
    "",
    response_model=schemas.Receipt,
    status_code=status.HTTP_201_CREATED,
    summary="Send an enquiry",
    description="A reply comes from a named person, within two business days.",
)
def create_enquiry(payload: schemas.EnquiryIn, db: Session = Depends(get_db)) -> schemas.Receipt:
    count = db.scalar(select(func.count()).select_from(models.Enquiry)) or 0
    enquiry = models.Enquiry(
        reference=f"XC-E-{count + 1:04d}",
        session_token=payload.session_token,
        name=payload.name,
        email=str(payload.email),
        organisation=payload.organisation,
        message=payload.message,
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    return schemas.Receipt(
        reference=enquiry.reference,
        received_at=enquiry.created_at or datetime.now(timezone.utc),
        status=enquiry.status,
        message="Received. Your Mandate Lead replies within two business days.",
    )
