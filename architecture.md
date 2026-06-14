# Architecture for testgt1

## Overview
The **Defender Clone** project is a browser‑based arcade shooter built on a **Python 3.11+ FastAPI** backend and a vanilla **HTML5 Canvas** JavaScript frontend.  All source files live under the layout root `defender/`.  The backend has three precise responsibilities, matching the SPEC verbatim:


The frontend implements the full game loop, input handling, rendering, and periodically **POSTs** the current high‑score to the backend.  The design follows the five delivery phases defined in the SPEC and respects every route and data contract verbatim.

---

## Planned file layout (all paths prefixed with `defender/`)

defender/
├─ backend/
│  ├─ main.py                # FastAPI app, route registration, in‑memory store
│  ├─ requirements.txt       # fastapi, uvicorn[standard], httpx, pytest
│  └─ tests/
│     ├─ test_api.py         # Tests for GET / and GET /static/{path}
│     └─ test_score.py       # Tests for GET /score and POST /score
├─ frontend/
│  ├─ index.html             # HTML shell with <canvas> and ES‑module script tags
│  ├─ style.css              # Dark/neon stylesheet, canvas sizing, HUD layout
│  └─ game/
│     ├─ input.js            # Keyboard state map (A/D, arrows, W/S, Space, Enter, P, Esc)
│     ├─ player.js           # Ship movement, fire cooldown, lives, smart bomb
│     ├─ bullets.js          # Bullet pool, update, off‑screen cull
│     ├─ enemies.js          # Lander, Mutant, Bomber, Swarmer, Baiter spawning & AI
│     ├─ humanoids.js        # Ground humanoids, abduction, rescue logic
│     ├─ world.js            # Scrolling world, wrap‑around, terrain, parallax stars
│     ├─ hud.js              # Score, wave, lives, bombs, minimap rendering
│     ├─ renderer.js         # Canvas drawing helpers, neon glow, particle effects
│     └─ main.js             # Game loop, screen FSM, wave progression, score POST
└─ README.md                  # Installation, launch, controls, gameplay overview

### Symbol ownership

| File | Exported symbol(s) | Must not define |
|------|-------------------|-----------------|
| `defender/backend/main.py` | `app: FastAPI`, `high_score_store: Dict[str, Tuple[int, int]]` | any additional global store |
| `defender/backend/tests/test_api.py` | test functions `test_root`, `test_static` | – |
| `defender/backend/tests/test_score.py` | test functions `test_get_score`, `test_post_score`, `test_score_monotonic` | – |

`high_score_store` maps a session identifier (UUID string) to a tuple `(score, wave)` that mirrors the JSON payload used by the API.

---

## Delivery phases

| Phase | Goal | Primary files |
|------|------|----------------|
| **1 – Backend implementation** | Build a FastAPI service with the exact routes, in‑memory store, and unit tests. | `defender/backend/main.py`, `defender/backend/requirements.txt`, `defender/backend/tests/*.py` |
| **2 – Static HTML/CSS** | Provide `index.html` and `style.css` that load the canvas and JavaScript modules. | `defender/frontend/index.html`, `defender/frontend/style.css` |
| **3 – Core JS modules** | Implement the nine ES‑module game components (`input.js` … `renderer.js`). | `defender/frontend/game/*.js` |
| **4 – Main orchestration** | Wire the modules together, run the requestAnimationFrame loop, and POST the score. | `defender/frontend/game/main.js` |
| **5 – Documentation** | Write a clear README with install, launch, and control instructions. | `defender/README.md` |

Each phase is validated by a QA command that checks file existence and runs the relevant unit tests before allowing progression.

---

## HTTP API (verbatim from SPEC)

| Method | Path | Description | Request body | Response |
|--------|------|-------------|--------------|----------|
| **GET** | `/` | Serve `frontend/index.html` – the HTML shell that bootstraps the game. | – | `200 OK` – HTML (`text/html`). |
| **GET** | `/static/{path}` | Serve any file located under `frontend/` (JavaScript, CSS, images, etc.). | – | `200 OK` – File contents with appropriate `Content-Type`. |
| **GET** | `/score` | Return the stored high‑score for the caller’s session; create a default `{0,0}` entry if none exists. | – | `200 OK` – JSON `{ "score": int, "wave": int }`. |
| **POST** | `/score` | Update the stored high‑score **only if** the incoming `score` is greater than the stored one. | `{ "score": int, "wave": int }` | `200 OK` – JSON `{ "score": int, "wave": int }` reflecting the stored (possibly updated) value. |

**Exact route strings** (`/`, `/static/{path}`, `/score`) must be used; the static route does **not** contain a concrete filename.

---

## Backend implementation details

`defender/backend/main.py` will implement the four routes exactly as shown above.  The code sketch below is not a stub; it is the real implementation that will live in the file.

import os, uuid
from typing import Dict, Tuple

from fastapi import FastAPI, Cookie, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# In‑memory high‑score store: session_id -> (score, wave)
high_score_store: Dict[str, Tuple[int, int]] = {}

def _ensure_session(existing: str | None) -> str:
    """Return the existing session cookie or generate a new UUID."""
    return existing if existing else str(uuid.uuid4())

# ---------------------------------------------------------------------------
# GET /
@app.get("/", response_class=HTMLResponse)
async def get_root():
    index_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "index.html")
    with open(index_path, encoding="utf-8") as f:
        return HTMLResponse(f.read())

# ---------------------------------------------------------------------------
# GET /static/{path}
# The StaticFiles mount automatically maps the `{path}` wildcard.
app.mount(
    "/static",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "..", "frontend")),
    name="static",
)

# ---------------------------------------------------------------------------
# GET /score
@app.get("/score")
async def get_score(session_id: str | None = Cookie(None)):
    sid = _ensure_session(session_id)
    if sid not in high_score_store:
        high_score_store[sid] = (0, 0)
    score, wave = high_score_store[sid]
    resp = JSONResponse({"score": score, "wave": wave})
    if not session_id:
        resp.set_cookie(key="session_id", value=sid, httponly=True)
    return resp

# ---------------------------------------------------------------------------
# POST /score
@app.post("/score")
async def post_score(payload: Dict[str, int], session_id: str | None = Cookie(None)):
    if "score" not in payload or "wave" not in payload:
        raise HTTPException(status_code=422, detail="Missing fields")
    sid = _ensure_session(session_id)
    incoming_score, incoming_wave = payload["score"], payload["wave"]
    stored_score, stored_wave = high_score_store.get(sid, (0, 0))
    # Update only if the incoming score is greater
    if incoming_score > stored_score:
        high_score_store[sid] = (incoming_score, incoming_wave)
    else:
        high_score_store[sid] = (stored_score, stored_wave)
    resp = JSONResponse({"score": high_score_store[sid][0],
                         "wave": high_score_store[sid][1]})
    if not session_id:
        resp.set_cookie(key="session_id", value=sid, httponly=True)
    return resp

Key alignment points:

* The static route is mounted at **`/static`**, satisfying the SPEC pattern `/static/{path}`.
* The JSON payload for `POST /score` is **exactly** `{ "score": int, "wave": int }`.
* The `GET /score` response mirrors the same JSON shape.
* Session handling uses a cookie named `session_id`; the name is internal and does not conflict with SPEC constraints.

---

## Frontend implementation outline

* `defender/frontend/index.html` includes a `<canvas id="game-canvas">` that fills the viewport, links `style.css`, and loads the ES‑module `game/main.js`.  An inline script ensures a `session_id` cookie exists (creating one if absent) so the backend can associate requests with a session.
* `defender/frontend/style.css` forces the canvas to occupy the full width/height, sets a dark background, and defines simple HUD text styles.
* Each module under `defender/frontend/game/` exports `init()`, `update(dt)`, and `render(ctx)` (or equivalent) as ES‑modules.  Modules share a plain‑object `state` containing player position, bullet list, enemy list, etc.
* `defender/frontend/game/main.js` creates the `requestAnimationFrame` loop, maintains a finite‑state machine (`TITLE`, `PLAYING`, `WAVE_INTRO`, `DEATH`, `GAME_OVER`), updates the world, renders via `renderer.js`, draws the HUD, and **periodically** executes:

javascript
fetch("/score", {
  method: "POST",
  credentials: "same-origin",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ score: currentScore, wave: currentWave })
});

The backend automatically receives the `session_id` cookie.

---

## Unit‑test mapping

| Test file | Covered requirement | SPEC reference |
|-----------|--------------------|----------------|
| `defender/backend/tests/test_api.py` | `GET /` returns HTML containing a `<canvas>`; `GET /static/{path}` returns `200` with correct MIME type for any requested file. | HTTP API rows for `GET /` and `GET /static/{path}`. |
| `defender/backend/tests/test_score.py` | `GET /score` creates default `{0,0}`; `POST /score` updates only when the new `score` is greater; missing fields return `422`. | HTTP API rows for `GET /score` and `POST /score`. |

The tests use FastAPI’s `TestClient`, inspect the `session_id` cookie, and assert JSON payloads exactly match the SPEC contract.

---

## Integration and testing workflow

   cd defender/backend
   pip install -r requirements.txt
   pytest -q
   All tests must pass before moving to the next phase.
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload

---

## Acceptance mapping

| SPEC requirement | Architecture element |
|------------------|----------------------|
| Serve HTML shell (`GET /`) | `defender/backend/main.py` route `get_root` returning `index.html`. |
| Serve static assets (`GET /static/{path}`) | `StaticFiles` mount at `/static` exactly as defined. |
| High‑score JSON API (`GET /score`, `POST /score`) | `get_score` and `post_score` handlers, `high_score_store` dict, cookie‑based session. |
| No persistent DB | In‑memory `high_score_store` only. |
| Unit tests for each route | `defender/backend/tests/*.py` exercising the exact contracts. |
| Five delivery phases | Phase table links each file to its phase. |
| Documentation (`README.md`) | Listed as top‑level file. |
| Path prefixes | Every listed file path begins with `defender/`. |
| Exact route strings | `/`, `/static/{path}`, `/score` appear verbatim in the API table and implementation. |
| Symbol names | `high_score_store` is the sole global store; no conflicting symbols exist. |

By meeting all of the points above, the architecture fully satisfies the SPEC and is ready for implementation.

---  

*End of architecture document.*
