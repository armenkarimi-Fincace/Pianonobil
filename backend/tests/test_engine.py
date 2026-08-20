"""The engine.

These figures are taken from the original model, so they are a regression test
against the House's own numbers rather than against this implementation.
"""

import pytest

from app.catalog import build_catalog
from app.engine import Engine

SPEC = dict(
    family="cm",
    institution_type="pop",
    jurisdiction="adgm",
    second="hybrid",
    capital=12,
    selections={
        "liq": "b", "reg": "a", "tech": "b", "risk": "c", "bank": "c",
        "ops": "b", "mkt": "b", "hc": "b", "crm": "b",
    },
)


@pytest.fixture
def engine(db):
    return Engine(build_catalog(db))


def test_a_full_specification_produces_the_expected_figures(engine):
    R = engine.build(**SPEC)
    assert R["capex"] == 1071000
    assert R["opex_monthly"] == 262500
    assert R["licence_months"] == 23      # ADGM's 9 months plus the layers' shift
    assert R["go_live_month"] == 26
    assert R["model_version"] == "M-2026.08"


def test_every_figure_traces_to_the_coefficient_registry(engine):
    """The licence fee and the House's documentation rate are registry rows."""
    R = engine.build(**SPEC)
    lines = {line["line"]: line["capex"] for line in R["lines"]}
    assert lines["Licence application and legal — ADGM · Abu Dhabi"] == engine.co("lic.adgm")
    assert lines["Structure, policies and documentation"] == engine.co("doc.house")


def test_the_six_pools_are_stated_and_two_are_held_rather_than_spent(engine):
    R = engine.build(**SPEC)
    assert len(R["pools"]) == 6
    assert [p["held"] for p in R["pools"]] == [False, False, True, False, False, True]
    assert R["pools"][-1]["n"] == "Contingency reserve"
    # The contingency is a tenth of the five pools above it.
    five = sum(p["v"] for p in R["pools"][:5])
    assert R["pools"][-1]["v"] == pytest.approx(five * 0.10)


def test_required_capital_carries_the_ten_per_cent_contingency(engine):
    R = engine.build(**SPEC)
    five = sum(p["v"] for p in R["pools"][:5])
    assert R["required"] == pytest.approx(five * 1.10)
    assert R["gap"] == pytest.approx(R["committed"] - R["required"])


def test_a_regulatory_delay_moves_permission_four_months_right(engine):
    base = engine.build(**SPEC)
    shocked = engine.build(**SPEC, shocks=["reg"])
    assert shocked["licence_months"] == base["licence_months"] + 4
    assert shocked["go_live_month"] == base["go_live_month"] + 4


def test_a_cost_shock_raises_running_cost_by_eight_per_cent(engine):
    base = engine.build(**SPEC)
    shocked = engine.build(**SPEC, shocks=["cost"])
    assert shocked["opex_monthly"] == pytest.approx(base["opex_monthly"] * 1.08)


def test_nothing_is_earned_before_go_live(engine):
    R = engine.build(**SPEC)
    assert all(r == 0 for r in R["revenue"][: R["go_live_month"] - 1])
    # …and the cost line runs from the first month regardless.
    assert all(c > 0 for c in R["cost"])


def test_the_second_determination_multiplies_steady_revenue(engine):
    a = engine.build(**{**SPEC, "second": "abook"})
    b = engine.build(**{**SPEC, "second": "bbook"})
    assert b["steady_revenue"] == pytest.approx(a["steady_revenue"] * 2.05)


def test_five_years_reconcile_with_the_monthly_series(engine):
    R = engine.build(**SPEC)
    assert len(R["year"]) == 5
    assert sum(y["rev"] for y in R["year"]) == pytest.approx(sum(R["revenue"]))
    assert R["year"][-1]["cum"] == pytest.approx(R["cumulative"][59])


def test_an_unspecified_layer_simply_contributes_nothing(engine):
    partial = engine.build(**{**SPEC, "selections": {"liq": "b"}})
    assert partial["capex"] < engine.build(**SPEC)["capex"]
