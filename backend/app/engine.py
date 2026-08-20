"""The engine, in Python.

A line-for-line port of the TypeScript engine the frontend runs, kept in step
so that a Model Record frozen server-side carries exactly the figures the
principal saw on screen. The ordering of the multiplications and the magic
constants are the original's; changing either would change every number the
environment has ever shown.
"""

from __future__ import annotations

import math
from typing import Any

CONTINGENCY_NOTE = "Held outside all five. Untouched in phase one, by design."
DRAWN = [62, 40, 12, 8, 4, 0]


class EngineError(ValueError):
    """Raised when the specification names something the catalog does not hold."""


class Engine:
    """Computes an institution from the catalog and a specification."""

    def __init__(self, catalog: dict[str, Any]) -> None:
        self.catalog = catalog

    # -- coefficients -------------------------------------------------------

    def co(self, key: str) -> float:
        for row in self.catalog["coefficients"]["rows"]:
            if row["k"] == key:
                return float(row["v"])
        return 0.0

    def jurisdiction_fee(self, key: str) -> float:
        return self.co(self.catalog["jurisdictions"][key]["lic"])

    def jurisdiction_capital(self, key: str) -> float:
        cap = self.catalog["jurisdictions"][key].get("cap")
        return self.co(cap) if cap else 0.0

    # -- the build ----------------------------------------------------------

    def build(
        self,
        *,
        family: str,
        institution_type: str,
        jurisdiction: str,
        second: str | None = None,
        capital: float = 8,
        scale: float | None = None,
        selections: dict[str, str] | None = None,
        shocks: list[str] | None = None,
        effects: dict[str, float] | None = None,
    ) -> dict[str, Any]:
        selections = selections or {}
        shock_set = set(shocks or [])
        effects = effects or {}

        try:
            F = self.catalog["families"][family]
            T = F["types"][institution_type]
            J = self.catalog["jurisdictions"][jurisdiction]
        except KeyError as exc:  # pragma: no cover - guarded by the router
            raise EngineError(f"unknown catalog key: {exc}") from exc

        scale_value = float(T["def"]) if scale is None else float(scale)
        second_opt = F["second"]["opts"].get(second) if second else None
        sec_mult = float(second_opt["mult"]) if second_opt else 1.0

        capex = 0.0
        opex_m = 0.0
        capacity = 1.0
        ramp = 1.0
        shift = 0
        house_capex = 0.0
        lines: list[dict[str, Any]] = []

        for layer in F["layers"]:
            option_id = selections.get(layer["key"])
            if not option_id:
                continue
            option = next((o for o in layer["options"] if o["id"] == option_id), None)
            if option is None:
                continue
            capex += option["capex"]
            opex_m += option["opex"]
            shift += option["months"]
            capacity *= option["capacity"]
            ramp *= option["ramp"]
            if layer["by"] == "House":
                house_capex += option["capex"]
            lines.append(
                {
                    "line": f"{layer['name']} — {option['name']}",
                    "by": layer["by"],
                    "capex": option["capex"],
                    "opex": option["opex"],
                }
            )

        licence_fee = self.jurisdiction_fee(jurisdiction)
        doc_house = self.co("doc.house")

        lines.append(
            {"line": f"Licence application and legal — {J['n']}", "by": "Managed", "capex": licence_fee, "opex": 0}
        )
        lines.append(
            {"line": "Structure, policies and documentation", "by": "House", "capex": doc_house, "opex": 0}
        )
        capex += licence_fee + doc_house
        house_capex += doc_house
        opex_m += self.co("ops.base")

        capacity *= effects.get("cap", 1) or 1
        ramp *= effects.get("ramp", 1) or 1
        opex_m += effects.get("opex", 0) or 0
        capex += effects.get("cost", 0) or 0
        shift += int(effects.get("months", 0) or 0)
        if "cost" in shock_set:
            opex_m *= 1.08

        licence_months = max(2, J["mo"] + shift + (4 if "reg" in shock_set else 0))
        go_live = licence_months + 3
        steady = scale_value * T["yield"] * sec_mult * capacity

        revenue: list[float] = []
        cost: list[float] = []
        cumulative: list[float] = []
        running = 0.0

        for month in range(1, 61):
            slope = (7.5 if "acq" in shock_set else 4.4) / max(0.5, ramp)
            mid = go_live + (14 if "acq" in shock_set else 8) / max(0.5, ramp)
            r = 0.0 if month < go_live else steady / (1 + math.exp(-(month - mid) / slope))
            if "vol" in shock_set and go_live + 2 <= month < go_live + 5:
                r *= 1.35
            if "vol" in shock_set and month >= go_live + 5:
                r *= 0.92
            if "sup" in shock_set and go_live + 6 <= month < go_live + 12:
                r *= 0.65
            o = opex_m * 0.42 if month < go_live else opex_m
            revenue.append(r)
            cost.append(o)
            running += r - o
            cumulative.append(running)

        break_even = 0
        for i in range(60):
            if revenue[i] >= cost[i]:
                break_even = i + 1
                break

        held = T["liq"] * scale_value * 1000 * (1.5 if sec_mult > 1.3 else 0.9 if sec_mult < 1 else 1.2)
        pools = [
            {"n": F["pools"][0], "v": capex - licence_fee, "note": F["poolNote"][0], "held": False},
            {
                "n": F["pools"][1],
                "v": licence_fee + self.jurisdiction_capital(jurisdiction),
                "note": F["poolNote"][1],
                "held": False,
            },
            {"n": F["pools"][2], "v": held, "note": F["poolNote"][2], "held": True},
            {"n": F["pools"][3], "v": opex_m * 24, "note": F["poolNote"][3], "held": False},
            {"n": F["pools"][4], "v": opex_m * 0.22 * 12, "note": F["poolNote"][4], "held": False},
        ]

        subtotal = sum(p["v"] for p in pools)
        pools.append({"n": "Contingency reserve", "v": subtotal * 0.10, "note": CONTINGENCY_NOTE, "held": True})

        total = sum(p["v"] for p in pools)
        for i, pool in enumerate(pools):
            pool["share"] = round(pool["v"] / total * 100) if total else 0
            pool["drawn"] = DRAWN[i]

        required = subtotal * 1.10
        committed = capital * 1e6 + (effects.get("inject", 0) or 0) * 1e6

        year = []
        for y in range(1, 6):
            rr = sum(revenue[(y - 1) * 12 : y * 12])
            cc = sum(cost[(y - 1) * 12 : y * 12])
            year.append({"y": y, "rev": rr, "cost": cc, "res": rr - cc, "cum": cumulative[y * 12 - 1]})

        return {
            "scale": scale_value,
            "second_multiplier": sec_mult,
            "lines": lines,
            "capex": capex,
            "house_capex": house_capex,
            "vendor_capex": capex - house_capex,
            "opex_monthly": opex_m,
            "licence_months": licence_months,
            "go_live_month": go_live,
            "steady_revenue": steady,
            "revenue": revenue,
            "cost": cost,
            "cumulative": cumulative,
            "break_even_month": break_even,
            "pools": pools,
            "required": required,
            "committed": committed,
            "gap": committed - required,
            "capacity": capacity,
            "ramp": ramp,
            "year": year,
            "model_version": self.catalog["coefficients"]["version"],
        }
