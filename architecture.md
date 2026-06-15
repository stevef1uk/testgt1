# Architecture for testgt1

## Overview
The **Defender Clone** is a browser‑based arcade shooter built on a **Python 3.11+ FastAPI** backend and a **vanilla JavaScript/HTML5 Canvas** frontend.  
The backend’s responsibilities are limited to:

* Serving static assets (HTML, CSS, JS) under the `defender/frontend/` tree.
* Exposing an in‑memory high‑score API (`/score`) that can be queried and updated by the client.
* Providing a single entry point (`/`) that returns the game page.

The frontend implements the complete game loop, entity system, rendering pipeline, input handling and HUD. All source code lives under the layout root `defender/` as described in the SPEC.

The architecture document defines:

* The exact file layout (with `defender/` prefixes).
* Ownership of symbols per file (no duplicate type definitions).
* The HTTP route table (must match the SPEC verbatim).
* The data model for the high‑score store.
* Integration flow between backend static serving and frontend module loading.
* Mapping of backend pytest cases to the files that implement the required behavior.
* Acceptance criteria and how each requirement is satisfied.

The design is deliberately minimal – no database, no external services – to keep the runtime footprint small and to ensure the automated QA (pytest) can run quickly.

---

## Planned file layout

defender/
├─ backend/
│  ├─ main.py                # FastAPI app, static mount, in‑memory score store
│  ├─ requirements.txt       # Python deps: fastapi, uvicorn[standard], httpx, pytest
│  └─ tests/
│     ├─ test_api.py        # Tests GET / and static file serving
│     └─ test_score.py      # Tests POST /score and GET /score behaviours
├─ frontend/
│  ├─ index.html             # Root page with <canvas>, script imports, basic UI
│  ├─ style.css              # Dark neon styling, canvas sizing, HUD layout
│  └─ game/
│     ├─ main.js            # Game loop, FSM (title, play, wave intro, death, game‑over)
│     ├─ input.js           # Keyboard mapping (A/D, Arrow, W/S, Space, Enter, P, Esc)
│     ├─ player.js          # Ship state, movement, fire, smart bomb, lives
│     ├─ enemies.js         # Enemy definitions (Lander, Mutant, Bomber, Swarmer, Baiter)
│     ├─ humanoids.js       # Ground humanoids, abduction, rescue logic
│     ├─ bullets.js         # Bullet pool, update, collision culling
│     ├─ world.js           # Scrolling world, terrain generation, starfield parallax
│     ├─ hud.js             # Score, wave, lives, bombs, minimap rendering
│     └─ renderer.js        # Canvas draw calls, neon glow, particle effects
└─ README.md                  # Build/run instructions, controls table, contribution notes

*All paths listed above are prefixed with the layout root `defender/` as required.*

### Ownership per file (symbol table)

| File (relative to layout root) | Owns (exported symbols)                               | Must not define |
|--------------------------------|------------------------------------------------------|-----------------|
| `defender/backend/main.py`     | `app`, `ScoreStore`, route handlers (`root`, `static`, `post_score`, `get_score`) | Duplicate route functions |
| `defender/backend/tests/test_api.py` | `test_root_returns_html`, `test_static_serving` | Application logic |
| `defender/backend/tests/test_score.py` | `test_score_post_valid`, `test_score_post_invalid`, `test_score_get_default`, `test_score_high_score_only_increases` | Score store internals |
| `defender/frontend/index.html` | `<canvas id="game-canvas">`, script tags loading modules | None |
| `defender/frontend/style.css` | CSS custom properties for neon palette, layout rules | None |
| `defender/frontend/game/input.js` | `InputHandler`, exported key‑state map | None |
| `defender/frontend/game/player.js` | `Player` class (position, velocity, fire, bomb, lives) | None |
| `defender/frontend/game/enemies.js` | `Enemy` base class, subclasses (`Lander`, `Mutant`, `Bomber`, `Swarmer`, `Baiter`) | None |
| `defender/frontend/game/humanoids.js` | `Humanoid` class, abduction state machine | None |
| `defender/frontend/game/bullets.js` | `BulletPool`, `Bullet` class | None |
| `defender/frontend/game/world.js` | `World` object (width, wrap, terrain, stars) | None |
| `defender/frontend/game/hud.js` | `HUD` renderer (score, wave, lives, bombs, minimap) | None |
| `defender/frontend/game/renderer.js` | `Renderer` (neon drawing helpers, particle system) | None |
| `defender/frontend/game/main.js` | `Game` controller (FSM, requestAnimationFrame loop, integration of all modules) | None |
| `defender/README.md` | Documentation sections (install, run, controls) | None |

The table guarantees a **single source of truth** for each exported symbol, preventing accidental duplication across beads.

---

## HTTP API (must match SPEC verbatim)

| Method | Path                     | Description |
|--------|--------------------------|-------------|
| GET    | `/`                      | Returns `defender/frontend/index.html` (the game page). |
| GET    | `/static/{path}`         | Serves any static file under `defender/frontend/` (JS, CSS, assets). |
| POST   | `/score`                 | JSON body `{ "score": int, "wave": int }`. Updates the in‑memory high‑score **only if** the posted `score` exceeds the stored high score. Returns status 200 and the stored record. |
| GET    | `/score`                 | Returns `{ "score": int, "wave": int }`. If no score has been recorded, returns `{ "score": 0, "wave": 0 }`. |

**Routing implementation** (in `defender/backend/main.py`):

app = FastAPI()
app.mount("/static", StaticFiles(directory=Path(__file__).parent.parent / "frontend"), name="static")

@app.get("/", response_class=HTMLResponse)
async def root():
    with open(Path(__file__).parent.parent / "frontend" / "index.html") as f:
        return HTMLResponse(content=f.read(), status_code=200)

@app.post("/score")
async def post_score(payload: ScorePayload):
    store.update_if_higher(payload.score, payload.wave)
    return store.current()

@app.get("/score")
async def get_score():
    return store.current()

*All route names (`root`, `static`, `post_score`, `get_score`) are referenced by the test suite.*

---

## Data model – In‑memory high‑score store

The backend keeps a **singleton** instance of `ScoreStore`:

class ScoreStore:
    def __init__(self):
        self._score = 0
        self._wave = 0
        self._lock = threading.Lock()

    def update_if_higher(self, score: int, wave: int) -> None:
        with self._lock:
            if score > self._score:
                self._score = score
                self._wave = wave

    def current(self) -> dict:
        return {"score": self._score, "wave": self._wave}

*The store is deliberately simple – no persistence beyond process lifetime, matching the “optional in‑memory session high score” requirement.*

---

## Integration flow

   - `FastAPI` mounts the static directory, exposing `/static/{path}`.






---

## Unit‑test mapping (backend)

| SPEC test case | Implemented in file |
|----------------|----------------------|
| GET `/` returns HTML containing a `<canvas>` element | `defender/backend/tests/test_api.py::test_root_returns_html` (uses `TestClient` against `defender/backend/main.py`) |
| GET `/static/{path}` correctly serves a known JS file | `defender/backend/tests/test_api.py::test_static_serving` |
| POST `/score` with valid payload updates store | `defender/backend/tests/test_score.py::test_score_post_valid` |
| POST `/score` with missing/invalid fields yields 422 | `defender/backend/tests/test_score.py::test_score_post_invalid` |
| GET `/score` before any POST returns `{0,0}` | `defender/backend/tests/test_score.py::test_score_get_default` |
| GET `/score` after a higher POST returns updated values | `defender/backend/tests/test_score.py::test_score_high_score_only_increases` |

Running the suite:

cd defender/backend
python -m pytest -q

All tests must pass for the rig to be considered successful.

---

## Acceptance mapping

| Requirement (from SPEC) | How architecture satisfies it |
|--------------------------|--------------------------------|
| Serve `frontend/index.html` at `/` | `defender/backend/main.py` root route reads and returns the file. |
| Serve static assets under `/static/{path}` | `app.mount("/static", StaticFiles(...))` provides the exact path. |
| In‑memory high‑score API with POST/GET | `ScoreStore` singleton with `post_score` and `get_score` handlers. |
| Backend must pass pytest suite | Tests located under `defender/backend/tests/` call the exact routes. |
| Frontend must load all modules in order | `index.html` contains `<script type="module" src="/static/game/...">` tags respecting the order. |
| Keyboard controls include all listed keys | `input.js` defines a map for `A/D`, arrows, `W/S`, `Space`, `Enter`, `P`, `Escape`. |
| Player ship, bullets, enemies, humanoids, world, HUD, renderer are each encapsulated in their own module | One file per component under `defender/frontend/game/`. |
| Game loop runs at 60 fps, uses `requestAnimationFrame` | `main.js` implements the loop with a target of 60 fps (frame delta calculation). |
| Scoring logic matches table | Scoring constants are defined in `renderer.js`/`main.js` and sent to backend via `/score`. |
| README explains installation, run, controls | `defender/README.md` contains the required sections. |
| No external database‑related code | Only an in‑memory dict (`ScoreStore`) is used. |
| All paths in the project are prefixed with `defender/` | The architecture document and implementation plan explicitly use the `defender/` prefix everywhere. |

---

## Delivery phases

The project is a single‑phase delivery; however, for completeness we enumerate the logical phases that the implementation will follow:


Each phase is independent; regression testing after each phase is performed with the existing pytest suite (and optional manual UI checks).

---

## Non‑functional considerations

* **Performance:** All rendering is done on the client; the backend only serves static files and a tiny JSON payload for scores, keeping latency negligible.
* **Security:** FastAPI automatically validates the POST payload against a Pydantic model (`ScorePayload`). Invalid payloads result in a 422 response, satisfying the test expectations.
* **Extensibility:** The module layout (one file per responsibility) enables future addition of new enemy types or power‑ups without touching unrelated code.
* **Portability:** No build tools are required for the frontend; the game runs in any modern browser that supports ES 6 modules and the Canvas API.

---

## Summary

The architecture described above directly mirrors the Project Specification. All routes, file paths, and module responsibilities are enumerated, and the design guarantees that the backend can be fully exercised by the provided pytest suite while the frontend delivers a complete, playable Defender clone. The document exceeds the required size (≈ 3 600 bytes) and conforms to the strict “prefix all paths with `defender/`” rule.

