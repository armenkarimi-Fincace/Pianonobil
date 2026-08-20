"""The catalog must survive PostgreSQL unchanged.

Every figure the environment renders comes from these rows, so a silent change
in the round-trip would be a change to the House's own numbers.
"""

from app.catalog import build_catalog
from app.seed_data import CATALOG


def _numeric(value):
    """0 and 0.0 are the same coefficient; JSON round-trips blur the two."""
    if isinstance(value, dict):
        return {k: _numeric(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_numeric(v) for v in value]
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return float(value)
    return value


def test_catalog_round_trips_unchanged(db):
    assert _numeric(build_catalog(db)) == _numeric(CATALOG)


def test_catalog_endpoint_serves_four_families_of_nine_layers(client):
    catalog = client.get("/api/v1/catalog").json()
    assert set(catalog["families"]) == {"cm", "aw", "bp", "as"}
    for family in catalog["families"].values():
        assert len(family["layers"]) == 9


def test_coefficient_registry_records_which_inputs_are_estimates(client):
    rows = client.get("/api/v1/catalog/coefficients").json()["rows"]
    assert len(rows) == 11
    # The environment states this count on every screen.
    assert sum(1 for r in rows if not r["ok"]) == 7


def test_jurisdiction_tiers(client):
    jurs = client.get("/api/v1/catalog/jurisdictions").json()
    assert jurs["adgm"]["tier"] == "onshore"
    assert jurs["stlucia"]["tier"] == "none"
    # Only onshore jurisdictions carry a regulatory capital requirement here.
    assert jurs["mauritius"]["cap"] is None


def test_unknown_family_is_a_404(client):
    assert client.get("/api/v1/catalog/families/nope").status_code == 404


def test_events_can_be_filtered_by_gate(client):
    events = client.get("/api/v1/catalog/events", params={"gate": 3}).json()
    assert len(events) == 1
    assert events[0]["gate"] == 3
    assert len(events[0]["c"]) == 3
