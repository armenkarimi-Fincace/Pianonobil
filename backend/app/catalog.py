"""Reading the catalog back out of PostgreSQL.

The tables are normalised for the sake of being editable — a coefficient, a
layer option or a jurisdiction note can be changed on its own row — but the
frontend wants one nested document. This module does that assembly, and it is
the only place that knows the mapping between the two shapes.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app import models


def build_catalog(db: Session) -> dict[str, Any]:
    """Assemble the whole catalog in the shape `GET /api/v1/catalog` serves."""
    coefficients = db.scalars(select(models.Coefficient).order_by(models.Coefficient.position)).all()
    version = coefficients[0].model_version if coefficients else "M-2026.08"

    jurisdictions = db.scalars(select(models.Jurisdiction).order_by(models.Jurisdiction.position)).all()
    families = db.scalars(
        select(models.Family)
        .options(
            selectinload(models.Family.types),
            selectinload(models.Family.second_options),
            selectinload(models.Family.layers).selectinload(models.Layer.options),
        )
        .order_by(models.Family.position)
    ).all()
    scenarios = db.scalars(select(models.Scenario).order_by(models.Scenario.position)).all()
    events = db.scalars(select(models.PassageEvent).order_by(models.PassageEvent.position)).all()
    gates = db.scalars(select(models.Gate).order_by(models.Gate.number)).all()
    templates = db.scalars(
        select(models.DocumentTemplate).order_by(
            models.DocumentTemplate.set_key, models.DocumentTemplate.position
        )
    ).all()

    # Every set key is present even when it holds nothing, so the response shape
    # does not change with the data. `none` legitimately adds no documents: an
    # unregulated incorporation asks for nothing beyond the party's own pack.
    document_templates: dict[str, list[dict[str, str]]] = {
        f"party_{form}": [] for form in ("individual", "company", "newco", "office")
    }
    document_templates.update({f"jur_{tier}": [] for tier in ("onshore", "mid", "offshore", "none")})
    for t in templates:
        document_templates.setdefault(t.set_key, []).append({"n": t.name, "d": t.detail, "k": t.kind})

    return {
        "coefficients": {
            "version": version,
            "owner": "Unassigned",
            "rows": [
                {"k": c.key, "v": c.value, "u": c.unit, "src": c.source, "ok": c.validated}
                for c in coefficients
            ],
        },
        "jurisdictions": {
            j.key: {
                "key": j.key,
                "n": j.name,
                "tier": j.tier,
                "tn": j.tier_name,
                "lic": j.licence_coefficient,
                "cap": j.capital_coefficient,
                "mo": j.months_to_permission,
                "note": j.note,
            }
            for j in jurisdictions
        },
        "families": {f.key: _family(f) for f in families},
        "scenarios": [{"k": s.key, "n": s.name, "d": s.description} for s in scenarios],
        "events": [
            {"id": e.key, "gate": e.gate, "t": e.title, "b": e.body, "v": e.house_view, "c": e.choices}
            for e in events
        ],
        "gates": [[g.reference, g.subject, g.criteria] for g in gates],
        "documentTemplates": document_templates,
    }


def _family(f: models.Family) -> dict[str, Any]:
    return {
        "key": f.key,
        "name": f.name,
        "blurb": f.blurb,
        "unit": f.unit,
        "u": f.unit_short,
        "min": f.scale_min,
        "max": f.scale_max,
        "step": f.scale_step,
        "types": {
            t.key: {
                "key": t.key,
                "n": t.name,
                "def": t.default_scale,
                "yield": t.yield_rate,
                "liq": t.liquidity_ratio,
                "note": t.note,
            }
            for t in f.types
        },
        "second": {
            "label": f.second_label,
            "key": f.second_key,
            "opts": {
                o.key: {"key": o.key, "n": o.name, "mult": o.multiplier, "why": o.why}
                for o in f.second_options
            },
        },
        "pools": f.pools,
        "poolNote": f.pool_notes,
        "layers": [
            {
                "key": layer.key,
                "name": layer.name,
                "by": layer.delivered_by,
                "q": layer.question,
                "options": [
                    {
                        "id": o.key,
                        "name": o.name,
                        "capex": o.capex,
                        "opex": o.opex,
                        "months": o.months,
                        "capacity": o.capacity,
                        "ramp": o.ramp,
                        "why": o.why,
                        "requires": o.requires,
                    }
                    for o in layer.options
                ],
            }
            for layer in f.layers
        ],
    }
