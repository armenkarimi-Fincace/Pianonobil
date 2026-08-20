"""Load the catalog into PostgreSQL.

Idempotent by design: a table that already holds rows is left alone, so this
can run on every startup without ever overwriting an edited coefficient. Use
`python -m app.seed --force` to wipe the catalog tables and reload them from
`app.seed_data`.
"""

from __future__ import annotations

import argparse
import logging

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app import models
from app.database import SessionLocal, engine
from app.seed_data import CATALOG

logger = logging.getLogger(__name__)

CATALOG_TABLES = [
    models.LayerOption,
    models.Layer,
    models.SecondOption,
    models.InstitutionType,
    models.Family,
    models.Jurisdiction,
    models.Coefficient,
    models.Scenario,
    models.PassageEvent,
    models.Gate,
    models.DocumentTemplate,
]


def catalog_is_empty(db: Session) -> bool:
    return db.scalar(select(models.Family.id).limit(1)) is None


def clear_catalog(db: Session) -> None:
    """Remove every catalog row, children first."""
    for model in CATALOG_TABLES:
        db.execute(delete(model))
    db.commit()


def seed(db: Session, *, force: bool = False) -> bool:
    """Seed the catalog. Returns True when rows were written."""
    if not catalog_is_empty(db):
        if not force:
            logger.info("Catalog already present; leaving it untouched.")
            return False
        clear_catalog(db)

    version = CATALOG["coefficients"]["version"]

    for i, row in enumerate(CATALOG["coefficients"]["rows"]):
        db.add(
            models.Coefficient(
                key=row["k"],
                value=row["v"],
                unit=row["u"],
                source=row["src"],
                validated=row["ok"],
                model_version=version,
                position=i,
            )
        )

    for i, (key, j) in enumerate(CATALOG["jurisdictions"].items()):
        db.add(
            models.Jurisdiction(
                key=key,
                name=j["n"],
                tier=j["tier"],
                tier_name=j["tn"],
                licence_coefficient=j["lic"],
                capital_coefficient=j["cap"],
                months_to_permission=j["mo"],
                note=j["note"],
                position=i,
            )
        )

    for fi, (fkey, f) in enumerate(CATALOG["families"].items()):
        family = models.Family(
            key=fkey,
            name=f["name"],
            blurb=f["blurb"],
            unit=f["unit"],
            unit_short=f["u"],
            scale_min=f["min"],
            scale_max=f["max"],
            scale_step=f["step"],
            second_label=f["second"]["label"],
            second_key=f["second"]["key"],
            pools=f["pools"],
            pool_notes=f["poolNote"],
            position=fi,
        )
        for ti, (tkey, t) in enumerate(f["types"].items()):
            family.types.append(
                models.InstitutionType(
                    key=tkey,
                    name=t["n"],
                    default_scale=t["def"],
                    yield_rate=t["yield"],
                    liquidity_ratio=t["liq"],
                    note=t["note"],
                    position=ti,
                )
            )
        for si, (skey, s) in enumerate(f["second"]["opts"].items()):
            family.second_options.append(
                models.SecondOption(
                    key=skey, name=s["n"], multiplier=s["mult"], why=s["why"], position=si
                )
            )
        for li, layer in enumerate(f["layers"]):
            row = models.Layer(
                key=layer["key"],
                name=layer["name"],
                delivered_by=layer["by"],
                question=layer["q"],
                position=li,
            )
            for oi, option in enumerate(layer["options"]):
                row.options.append(
                    models.LayerOption(
                        key=option["id"],
                        name=option["name"],
                        capex=option["capex"],
                        opex=option["opex"],
                        months=option["months"],
                        capacity=option["capacity"],
                        ramp=option["ramp"],
                        why=option["why"],
                        requires=option["requires"],
                        position=oi,
                    )
                )
            family.layers.append(row)
        db.add(family)

    for i, s in enumerate(CATALOG["scenarios"]):
        db.add(models.Scenario(key=s["k"], name=s["n"], description=s["d"], position=i))

    for i, e in enumerate(CATALOG["events"]):
        db.add(
            models.PassageEvent(
                key=e["id"],
                gate=e["gate"],
                title=e["t"],
                body=e["b"],
                house_view=e["v"],
                choices=e["c"],
                position=i,
            )
        )

    for i, g in enumerate(CATALOG["gates"]):
        db.add(models.Gate(number=i + 1, reference=g[0], subject=g[1], criteria=g[2]))

    for set_key, items in CATALOG["documentTemplates"].items():
        for i, item in enumerate(items):
            db.add(
                models.DocumentTemplate(
                    set_key=set_key, name=item["n"], detail=item["d"], kind=item["k"], position=i
                )
            )

    db.commit()
    logger.info("Catalog seeded.")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the Piano Nobile catalog.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace the catalog even if it already holds rows.",
    )
    parser.add_argument(
        "--create-tables",
        action="store_true",
        help="Create tables directly instead of relying on Alembic. For tests and throwaway databases.",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(message)s")

    if args.create_tables:
        models.Base.metadata.create_all(engine)

    with SessionLocal() as db:
        written = seed(db, force=args.force)
    print("Catalog seeded." if written else "Catalog already present; nothing written.")


if __name__ == "__main__":
    main()
