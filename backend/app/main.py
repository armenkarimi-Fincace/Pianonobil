"""The Piano Nobile — FastAPI application.

Serves the House's catalog, runs the model, and keeps the record a principal
produces while walking the environment. Interactive documentation is at `/docs`
(Swagger) and `/redoc`, and the OpenAPI schema at `/openapi.json`.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import get_settings
from app.database import SessionLocal, engine
from app.routers import catalog, enquiries, mandate, model, sessions, vestibule

logger = logging.getLogger(__name__)
settings = get_settings()

DESCRIPTION = """
The API behind **The Piano Nobile** — the principal floor of the House.

* **catalog** — the House's reference data: coefficients, jurisdictions, the four
  families with their nine layers each, stress scenarios, passage events and gates.
  Every figure the environment renders passes through the coefficient registry.
* **model** — the engine. A specification in, a sixty-month projection out.
* **sessions** — a walk in progress, so a reload does not lose it.
* **vestibule** — the document pack, and the Requirements Register a principal lodges.
* **mandate** — the register of determinations, which cannot be amended.
* **enquiries** — correspondence addressed to the House.

X-CHASE is not a regulated bank, broker, asset manager or investment advisor.
Figures produced by the model are illustrative and are not a forecast, a
projection, or a representation of expected results.
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Verify the database is reachable, and seed the catalog if it is empty."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Could not reach the database at startup.")
    else:
        if settings.seed_on_startup:
            try:
                from app.seed import seed

                with SessionLocal() as db:
                    seed(db)
            except Exception:
                logger.exception("Could not seed the catalog. Run migrations first.")
    yield


app = FastAPI(
    title=settings.project_name,
    description=DESCRIPTION,
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_tags=[
        {"name": "catalog", "description": "The House's reference data."},
        {"name": "model", "description": "The engine. One computation, every figure."},
        {"name": "sessions", "description": "A walk in progress."},
        {"name": "vestibule", "description": "Identity, documents and the Requirements Register."},
        {"name": "mandate", "description": "The register of determinations."},
        {"name": "enquiries", "description": "Correspondence addressed to the House."},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (catalog.router, model.router, sessions.router, vestibule.router, mandate.router, enquiries.router):
    app.include_router(router, prefix=settings.api_prefix)


@app.get("/health", tags=["health"], summary="Liveness and database reachability")
def health() -> dict[str, str]:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        return {"status": "degraded", "database": "unreachable"}
    return {"status": "ok", "database": "ok"}


@app.get("/", tags=["health"], summary="Where to look")
def root() -> dict[str, str]:
    return {
        "name": settings.project_name,
        "docs": "/docs",
        "openapi": "/openapi.json",
        "catalog": f"{settings.api_prefix}/catalog",
    }
