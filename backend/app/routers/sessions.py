"""Walk sessions — so that a reload does not lose a walk in progress."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post(
    "",
    response_model=schemas.SessionOut,
    status_code=status.HTTP_201_CREATED,
    summary="Open a session",
    description="Returns a token the environment keeps, so the walk can be resumed.",
)
def create_session(payload: schemas.SessionIn, db: Session = Depends(get_db)) -> models.WalkSession:
    session = models.WalkSession(token=uuid.uuid4().hex, state=payload.state)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get(
    "/{token}",
    response_model=schemas.SessionOut,
    summary="Resume a session",
)
def read_session(token: str, db: Session = Depends(get_db)) -> models.WalkSession:
    session = db.scalar(select(models.WalkSession).where(models.WalkSession.token == token))
    if session is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No session with that token.")
    return session


@router.put(
    "/{token}",
    response_model=schemas.SessionOut,
    summary="Save a session",
)
def update_session(
    token: str, payload: schemas.SessionIn, db: Session = Depends(get_db)
) -> models.WalkSession:
    session = db.scalar(select(models.WalkSession).where(models.WalkSession.token == token))
    if session is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No session with that token.")
    session.state = payload.state
    db.commit()
    db.refresh(session)
    return session
