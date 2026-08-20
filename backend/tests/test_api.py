"""The API surface: the model endpoint, sessions, and the record."""


SPEC = {
    "family": "cm",
    "institution_type": "pop",
    "jurisdiction": "adgm",
    "second": "hybrid",
    "capital": 12,
    "selections": {"liq": "b", "reg": "a", "tech": "b"},
}


def test_health(client):
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"


def test_compute_returns_a_sixty_month_projection(client):
    r = client.post("/api/v1/model/compute", json=SPEC)
    assert r.status_code == 200
    body = r.json()
    assert len(body["revenue"]) == 60
    assert len(body["cost"]) == 60
    assert len(body["cumulative"]) == 60


def test_compute_rejects_a_type_from_another_family(client):
    r = client.post("/api/v1/model/compute", json={**SPEC, "institution_type": "wm"})
    assert r.status_code == 422
    assert "Capital Markets" in r.json()["detail"]


def test_compute_rejects_an_unknown_jurisdiction(client):
    r = client.post("/api/v1/model/compute", json={**SPEC, "jurisdiction": "atlantis"})
    assert r.status_code == 422


def test_a_session_survives_a_reload(client):
    token = client.post("/api/v1/sessions", json={"state": {"zone": "m"}}).json()["token"]
    client.put(f"/api/v1/sessions/{token}", json={"state": {"zone": "v", "cap": 18}})
    assert client.get(f"/api/v1/sessions/{token}").json()["state"] == {"zone": "v", "cap": 18}


def test_an_unknown_session_token_is_a_404(client):
    assert client.get("/api/v1/sessions/nosuchtoken").status_code == 404


def test_the_document_pack_is_generated_from_party_and_jurisdiction(client):
    onshore = client.get(
        "/api/v1/vestibule/document-pack", params={"party": "company", "jurisdiction": "adgm"}
    ).json()
    offshore = client.get(
        "/api/v1/vestibule/document-pack", params={"party": "company", "jurisdiction": "seychelles"}
    ).json()
    unregulated = client.get(
        "/api/v1/vestibule/document-pack", params={"party": "company", "jurisdiction": "stlucia"}
    ).json()

    # The same legal form, but a heavier jurisdiction asks for more.
    assert len(onshore) > len(offshore) > len(unregulated)
    assert {d["k"] for d in unregulated} == {"core"}
    assert any(d["k"] == "jur" for d in onshore)


def test_the_document_pack_rejects_an_unknown_legal_form(client):
    r = client.get("/api/v1/vestibule/document-pack", params={"party": "sovereign"})
    assert r.status_code == 422


def test_lodging_the_requirements_register_returns_a_reference(client):
    r = client.post(
        "/api/v1/vestibule/requirements",
        json={
            "party": "company",
            "path": "turnkey",
            "family": "cm",
            "institution_type": "pop",
            "jurisdiction": "adgm",
            "answers": {f"s{i}": "own" for i in range(9)},
            "documents_ready": 15,
            "documents_total": 15,
        },
    )
    assert r.status_code == 201
    receipt = r.json()
    assert receipt["reference"].startswith("RR-")
    assert receipt["status"] == "under_consideration"

    stored = client.get(f"/api/v1/vestibule/requirements/{receipt['reference']}").json()
    assert len(stored["answers"]) == 9
    assert stored["documents_ready"] == 15


def test_an_enquiry_requires_a_real_email_address(client):
    good = client.post(
        "/api/v1/enquiries",
        json={"name": "A Principal", "email": "principal@example.com", "message": "A question."},
    )
    assert good.status_code == 201
    assert good.json()["reference"].startswith("XC-E-")

    bad = client.post(
        "/api/v1/enquiries", json={"name": "A Principal", "email": "not-an-email", "message": "x"}
    )
    assert bad.status_code == 422


def test_the_register_of_determinations_only_ever_appends(client):
    token = client.post("/api/v1/sessions", json={"state": {}}).json()["token"]
    payload = {
        "session_token": token,
        "decision_id": "D-021",
        "matter": "Liquidity — provider shortlist",
        "outcome": "Proceed with the recommended provider",
    }
    client.post("/api/v1/mandate/determinations", json=payload)
    # The same decision, reversed later, is recorded again rather than amended.
    client.post("/api/v1/mandate/determinations", json={**payload, "outcome": "Proceed with the alternative"})

    register = client.get("/api/v1/mandate/determinations", params={"session_token": token}).json()
    assert len(register) == 2
    assert {r["outcome"] for r in register} == {
        "Proceed with the recommended provider",
        "Proceed with the alternative",
    }
