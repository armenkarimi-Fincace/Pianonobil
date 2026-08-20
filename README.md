# The Piano Nobile

A rewrite of the X-CHASE *Piano Nobile* environment — originally a single
288 KB HTML file — as a **Next.js (App Router, TypeScript)** frontend, a
**Python FastAPI** backend and a **PostgreSQL** database.

The environment is a private instrument for principals: five zones entered in
order, thirty-four steps, and a financial model in which every figure on every
screen derives from one coefficient registry.

```
┌ Gateway ───────── one question, asked once
├ Works Room ────── for an institution that already operates   (5 steps)
├ Model Room ────── for an institution that does not exist yet (7 steps)
├ Vestibule ─────── identity, selection, response, agreement   (6 steps)
└ Mandate Room ──── the mandate as it runs                    (15 modules)
```

---

## Contents

- [What was preserved](#what-was-preserved)
- [Quick start with Docker](#quick-start-with-docker)
- [Running it without Docker](#running-it-without-docker)
- [Environment variables](#environment-variables)
- [Migrations](#migrations)
- [Seeding the catalog](#seeding-the-catalog)
- [API](#api)
- [Tests](#tests)
- [Project layout](#project-layout)
- [Design notes](#design-notes)
- [Known differences from the original](#known-differences-from-the-original)

---

## What was preserved

The rewrite is a port, not a reinterpretation. Fidelity was verified rather
than assumed:

| What | How it was checked | Result |
| --- | --- | --- |
| **The stylesheet** | All 321 selectors and 1,050 declarations of the original `<style>` block parsed and compared against the CSS Next.js serves | identical, modulo the minifier lowercasing hex and dropping quotes inside attribute selectors |
| **The visual result** | Both builds driven through the same twelve-screen walk in Chromium at 1440×1000 and compared pixel by pixel | 12 of 12 screens match; the largest residual is 0.003% of pixels (antialiasing) |
| **The engine** | 864 specifications spanning every family, institution type, jurisdiction, second determination and shock combination, run through the original JavaScript and through both ports | 247,796 values compared, **zero** differences in each |
| **The Works Room arithmetic** | 24 declared-standing scenarios across all four families | 888 comparisons, zero differences |
| **The catalog** | Seeded into PostgreSQL and read back out | byte-identical to the source data |

The data was **extracted programmatically** from the original file rather than
transcribed, so no coefficient, note, multiplier or jurisdiction figure could
drift in the move.

Also preserved: the two typefaces and their fallback stacks, the seal (now a
real `seal.png` rather than a 60 KB inlined data URI), every SVG figure, the
toast and notices behaviour, `⌘K` search, `Escape` to close, the gating rules
that decide what is open and why, and the exact wording of every screen.

---

## Quick start with Docker

Requires Docker with the Compose plugin.

```bash
git clone <this repository>
cd Pianonobil
docker compose up --build
```

Then open:

| | |
| --- | --- |
| Frontend | <http://localhost:3000> |
| API | <http://localhost:8000> |
| Swagger UI | <http://localhost:8000/docs> |
| ReDoc | <http://localhost:8000/redoc> |
| PostgreSQL | `localhost:5432` |

Compose runs `alembic upgrade head` before starting the API, and the catalog is
seeded automatically on first start. No `.env` is needed — every value has a
working default. To change ports or credentials, `cp .env.example .env` and edit.

To stop and discard the database volume:

```bash
docker compose down -v
```

---

## Running it without Docker

You need **Python 3.11+**, **Node 20+** and a **PostgreSQL 14+** you can
connect to.

### 1 · Database

```bash
createdb pianonobil
# or: psql -c "CREATE DATABASE pianonobil;"
```

### 2 · Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env          # then set DATABASE_URL
alembic upgrade head          # create the schema
python -m app.seed            # load the catalog

uvicorn app.main:app --reload --port 8000
```

Check it: <http://localhost:8000/health> should return
`{"status":"ok","database":"ok"}`.

### 3 · Frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # defaults already point at localhost:8000
npm run dev
```

Open <http://localhost:3000>.

---

## Environment variables

### `backend/.env`

| Variable | Default | What it does |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://pianonobil:pianonobil@localhost:5432/pianonobil` | SQLAlchemy connection string (psycopg 3 driver). Read by the API **and** by Alembic, so there is one source of truth. |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated browser origins allowed to call the API. `localhost` and `127.0.0.1` are different origins — reaching the frontend by the one you did not list is the usual cause of a blocked preflight. |
| `SEED_ON_STARTUP` | `1` | Seed the catalog at startup when it is empty. Never overwrites existing rows. |
| `ENVIRONMENT` | `development` | Anything other than `production` exposes `/docs` and `/redoc`. |

### `frontend/.env.local`

| Variable | Default | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | The API URL used **by the browser**. Inlined into the bundle at build time, so in Docker it is a build arg, not a runtime variable. |
| `API_BASE_URL` | falls back to the above | The API URL used by **server components**. Inside Compose this is `http://backend:8000`. |
| `NEXT_PUBLIC_OFFLINE_CATALOG` | `0` | Set to `1` to run entirely from the bundled catalog without contacting the backend — useful for design work offline. |

### Root `.env` (Compose only)

See [`.env.example`](.env.example): database credentials, and the three
published ports.

---

## Migrations

Alembic reads `DATABASE_URL` from the environment via `app.config`, so it always
targets the same database as the API.

```bash
cd backend

alembic upgrade head            # apply everything
alembic current                 # what is applied now
alembic history --verbose       # the full history
alembic downgrade -1            # step back one revision
```

After changing a model in `app/models.py`:

```bash
alembic revision --autogenerate -m "a short description"
# read the generated file before applying it — autogenerate is a draft, not an oracle
alembic upgrade head
```

Inside Compose, migrations run automatically before the API starts. To run one
by hand against a running stack:

```bash
docker compose exec backend alembic upgrade head
```

---

## Seeding the catalog

The catalog — coefficients, jurisdictions, the four families with their nine
layers each, the stress scenarios, the passage events, the six gates and the
Vestibule's document templates — lives in PostgreSQL and is served by
`GET /api/v1/catalog`.

```bash
cd backend
python -m app.seed                   # idempotent: skips a catalog that already exists
python -m app.seed --force           # wipe the catalog tables and reload
python -m app.seed --create-tables   # create tables directly, bypassing Alembic (throwaway DBs)
```

Seeding is safe to repeat: a table that already holds rows is left untouched,
so an edited coefficient is never silently overwritten.

The frontend keeps a byte-identical fallback copy at
`frontend/src/lib/catalog-fallback.ts`, used for server rendering, for offline
work and if the API is briefly unreachable. **Both copies were generated from
the original build.** If you change one, regenerate the other so they cannot
diverge.

---

## API

Interactive documentation is generated automatically at **`/docs`** (Swagger UI)
and **`/redoc`**; the OpenAPI schema is at `/openapi.json`.

| Method | Path | |
| --- | --- | --- |
| `GET` | `/health` | Liveness, and whether the database is reachable |
| `GET` | `/api/v1/catalog` | The whole catalog in one response |
| `GET` | `/api/v1/catalog/coefficients` | The coefficient registry |
| `GET` | `/api/v1/catalog/jurisdictions` | Jurisdictions |
| `GET` | `/api/v1/catalog/families` · `/families/{key}` | The four families |
| `GET` | `/api/v1/catalog/scenarios` | Stress scenarios |
| `GET` | `/api/v1/catalog/events?gate=` | Passage events, optionally by gate |
| `GET` | `/api/v1/catalog/gates` | The six gates |
| `POST` | `/api/v1/model/compute` | Run a specification through the engine |
| `POST` | `/api/v1/sessions` | Open a walk session |
| `GET` `PUT` | `/api/v1/sessions/{token}` | Resume or save a walk |
| `GET` | `/api/v1/vestibule/document-pack?party=&jurisdiction=` | The pack generated from legal form and jurisdiction |
| `POST` | `/api/v1/vestibule/requirements` | Lodge the Requirements Register |
| `GET` | `/api/v1/vestibule/requirements` · `/{reference}` | Read lodged registers |
| `POST` | `/api/v1/enquiries` | Send an enquiry |
| `POST` `GET` | `/api/v1/mandate/determinations` | The register of determinations |

Example:

```bash
curl -X POST http://localhost:8000/api/v1/model/compute \
  -H 'Content-Type: application/json' \
  -d '{
    "family": "cm",
    "institution_type": "pop",
    "jurisdiction": "adgm",
    "second": "hybrid",
    "capital": 12,
    "selections": {"liq":"b","reg":"a","tech":"b","risk":"c","bank":"c",
                   "ops":"b","mkt":"b","hc":"b","crm":"b"},
    "shocks": ["reg", "acq"]
  }'
```

### Which forms reach the backend

| Form | Endpoint | Effect |
| --- | --- | --- |
| Requirements Register (Vestibule, step 03) | `POST /api/v1/vestibule/requirements` | Stored with a reference (`RR-0001`) and shown back to the principal. If the API is unreachable, the walk still advances and the principal is told plainly that the lodgement did not reach the House. |
| Determine and record (Mandate Room, module 04) | `POST /api/v1/mandate/determinations` | Appended to a register that is never amended — a determination later reversed is written again, with both dates. |
| Enquiry | `POST /api/v1/enquiries` | Stored with a reference (`XC-E-0001`); the email address is validated. |

---

## Tests

The suite runs against a real PostgreSQL, because the models use `JSONB` and the
catalog round-trip is exactly what is worth testing.

```bash
cd backend
pip install -r requirements-dev.txt
createdb pianonobil_test

TEST_DATABASE_URL="postgresql+psycopg://pianonobil:pianonobil@localhost:5432/pianonobil_test" \
  pytest -q
```

27 tests cover the catalog round-trip, the engine's figures against the
original model, the gating of the document pack by jurisdiction tier, and the
API's validation and error paths.

Frontend checks:

```bash
cd frontend
npm run typecheck   # tsc --noEmit
npm run lint
npm run build
```

---

## Project layout

```
.
├── docker-compose.yml
├── .env.example
├── README.md
│
├── backend/
│   ├── alembic/                 migrations (env.py reads DATABASE_URL)
│   │   └── versions/0001_initial_schema.py
│   ├── app/
│   │   ├── main.py              app, CORS, lifespan, OpenAPI metadata
│   │   ├── config.py            settings from the environment
│   │   ├── database.py          engine, session, declarative base
│   │   ├── models.py            the catalog, and the record
│   │   ├── schemas.py           the API contract
│   │   ├── engine.py            the model, in Python
│   │   ├── catalog.py           normalised tables → one nested document
│   │   ├── seed.py              idempotent loader
│   │   ├── seed_data.py         the catalog (generated, do not hand-edit)
│   │   └── routers/             catalog · model · sessions · vestibule · mandate · enquiries
│   └── tests/
│
└── frontend/
    ├── src/app/                 layout, page, globals.css, icon
    ├── src/components/
    │   ├── chrome/              ZoneBar · MandateStrip · Rail · Toasts
    │   ├── overlays/            Map · Search · Notices
    │   ├── shared/              Head · Metrics · OptionRow · DataTable · …
    │   ├── figures/             the six SVG figures
    │   ├── gateway/ model/ works/ vestibule/ mandate/
    │   └── PianoNobile.tsx      the shell and the router
    ├── src/lib/                 engine · works · navigation · docpack · format · api · types
    └── src/store/useAppStore.ts state, transitions and gating
```

---

## Design notes

**Why the stylesheet is preserved rather than rewritten into utilities.**
The brief asked for Tailwind *and* for no visual change. Re-expressing 400 lines
of hand-tuned CSS as utility classes across forty components would have put
those two at odds, and every drift would have been invisible until someone
noticed it. So the original stylesheet is kept verbatim in `globals.css` inside
`@layer base`, and Tailwind is configured to read *the same custom properties*:
`bg-cream`, `text-maroon`, `font-optima`, `p-m5` and `max-w-measure` all resolve
to the values in `:root`. Components use utilities for layout and one-off
spacing, and the design-system classes (`.card`, `.opt`, `.metrics`, `.eyebrow`)
where the original did. The two layers share one set of tokens, so they cannot
drift.

Tailwind's **preflight is deliberately disabled**. The original ships its own
reset and then relies on browser defaults for what it does not restate — most
visibly the `list-style: disc` bullets inside `.card ul`. Preflight strips those,
which would change the rendering.

Where the original used an inline `style` attribute, the port generally keeps an
inline style. This is not laziness: several base rules are element selectors
nested in classes (`.keys i`, `.opt .mk`) which outrank a utility class on
specificity, so a utility there would silently lose. The rule of thumb applied
throughout is *utilities for what the original had no rule for; inline styles
where the original overrode its own cascade.*

**Why routing is state, not URL.** The original was a single-document instrument
in which the ordering of the walk is the substance — the Gateway asks one
question, and nothing downstream opens until it is answered. A URL router would
hand the browser a back button that skips gates, which would be a change to the
product, not to the implementation.

**Why the engine exists twice.** The frontend computes locally so that dragging
a slider stays instant; the backend runs the same computation for anything that
must be authoritative — freezing a Model Record, or an API consumer with no
frontend at all. The two are verified against the original and against each
other, and both are covered by the fixture suite above.

**Why the catalog is normalised in the database but nested in the API.** The
tables are normalised so that a single coefficient, layer option or jurisdiction
note can be edited on its own row. The frontend wants one document.
`app/catalog.py` is the only place that knows the mapping, which keeps that
translation in exactly one file.

**What is stored as JSON, and why.** Three things: the walk session state (owned
by the frontend, written on every determination, read only as a whole), an
event's choices (their effects vary per choice and are never queried
individually), and a lodged register's answers. Everything else is columns.

---

## Known differences from the original

Stated plainly rather than left to be discovered:

1. **Scroll position after a click that grows the page.** The original replaced
   the whole `#app` innerHTML on every render, which resets the browser's scroll
   anchoring; React mutates in place, so the browser keeps the clicked element
   stable and lands at a slightly different offset. Both builds scroll; they
   land 578px and 771px down respectively after selecting a jurisdiction.
   Emulating the original here would mean destroying and rebuilding the DOM on
   every keystroke, losing focus and input state — a regression in every other
   respect.

2. **The seal is a file, not a data URI.** `public/seal.png` (44 KB) instead of a
   60 KB base64 string inside the JavaScript. Identical image; it now caches.

3. **A favicon exists.** The original had none and browsers logged a 404 for it.

4. **`window.onerror` no longer swallows everything.** The original caught every
   error and rendered a "this section could not be displayed" panel. React error
   boundaries and the type system make most of that class of failure impossible
   at build time, and silently swallowing the rest would hide real faults.

5. **The forms now reach a backend.** In the original, marking a document or
   submitting the register changed only in-memory state. Those three flows now
   persist, and each returns a reference.

---

## Disclaimer

X-CHASE is not a regulated bank, broker, asset manager or investment advisor.
Figures produced by the model are illustrative and are not a forecast, a
projection, or a representation of expected results. No outcome is guaranteed.
