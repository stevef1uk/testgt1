# Architecture for **testgt1**

## Overview
The **Defender Clone** is a browser‑based arcade shooter.  It consists of a tiny Python FastAPI backend that serves the static HTML/JS/CSS assets, and provides a single in‑memory high‑score API (`/score`).  The frontend is a pure‑vanilla JavaScript single‑page application that renders a neon‑styled space‑shooter on an HTML5 `<canvas>` element.

* **Performance goal** – 60 fps rendering on modern browsers.  
* **Persistence goal** – no external storage; the backend keeps the highest score in a process‑local variable.  
* **Testing goal** – Python `pytest` unit tests cover the HTTP endpoints and static file serving; the frontend is exercised manually but the code is written to be deterministic and test‑friendly.

All source files live under the `defender/` directory, matching the layout described in `SPEC.md`.  The architecture below enumerates every required file, the responsibilities of each module, the data flow between client and server, and the mapping to the test suites.

---

## Planned file layout

| Path (prefixed with layout root) | Description |
|-----------------------------------|--------------|
| `defender/README.md` | Human‑readable installation, launch, and controls guide. |
| `defender/backend/main.py` | FastAPI entry point.  Mounts static files, defines the root (`/`) HTML response, and implements the `/score` JSON endpoint. |
| `defender/backend/requirements.txt` | Lists runtime dependencies: `fastapi`, `uvicorn`, `httpx`, `pytest`. |
| `defender/backend/tests/test_api.py` | Pytest suite exercising the root route (`/`) and static file serving (`/static/{path}`). |
| `defender/backend/tests/test_score.py` | Pytest suite exercising the `/score` endpoint: validation, high‑score storage, default response. |
| `defender/frontend/index.html` | The initial HTML page.  Contains a `<canvas id="game">` element, loads `style.css`, and pulls the JavaScript bundle from `game/main.js`. |
| `defender/frontend/style.css` | Dark neon theme, global styles, and canvas sizing. |
| `defender/frontend/game/input.js` | Keyboard state manager (key down/up → `pressed` map). |
| `defender/frontend/game/player.js` | Ship entity: movement, firing, smart‑bomb activation, lives & bomb counters. |
| `defender/frontend/game/bullets.js` | Projectile pool, lifecycle (spawn, move, collision, recycle). |
| `defender/frontend/game/enemies.js` | Enemy wave generator: spawn patterns, speed, health, and AI behaviours. |
| `defender/frontend/game/humanoids.js` | Abductable target entities, collision with player bullets, scoring rules. |
| `defender/frontend/game/world.js` | Scrolling wrap‑around world implementation (parallax background, bounds). |
| `defender/frontend/game/hud.js` | Heads‑up display: score, lives, bombs, wave indicator. |
| `defender/frontend/game/renderer.js` | Canvas drawing helpers: neon stroke/fill, particle effects, sprite compositing. |
| `defender/frontend/game/main.js` | Glues all modules together; contains the game loop (`requestAnimationFrame`) and a finite‑state machine (title, intro, gameplay, death, game‑over). |

*All paths are written with the `defender/` prefix as required.*

---

## HTTP Route Table

| Method | Path | Handler (file) | Expected Behaviour |
|--------|------|----------------|--------------------|
| `GET` | `/` | `defender/backend/main.py::root()` | Returns `defender/frontend/index.html` with a `<canvas>` element. |
| `GET` | `/static/{path:path}` | `defender/backend/main.py::static_files()` | Serves any file under `defender/frontend/` (e.g., `style.css`, `game/*.js`). |
| `GET` | `/score` | `defender/backend/main.py::get_score()` | Returns JSON `{ "high_score": <int> }`. If no score stored yet, returns `{ "high_score": 0 }`. |
| `POST` | `/score` | `defender/backend/main.py::post_score()` | Accepts JSON `{ "score": <int> }`. Validates that `score` is a non‑negative integer. Stores the value if it exceeds the current high‑score. Returns the new high‑score JSON. |
| `OPTIONS` | `*` | (automatic CORS handling) | Allows cross‑origin requests from the frontend (development mode). |

**Note:** The static route is deliberately generic (`/static/{path:path}`) to match the test expectations that static assets are reachable under `/static/…`.

---

## Data Model (Backend)

The backend stores only a single integer – the highest score achieved since process start.

# In defender/backend/main.py
high_score: int = 0   # module‑level mutable state

* **POST /score** – validates payload (`score` must be an integer ≥ 0). If `score > high_score`, replace `high_score`.  
* **GET /score** – returns the current `high_score`. When `high_score` is still `0`, the response is `{ "high_score": 0 }`.

No database, no file I/O – this satisfies the SPEC's “in‑memory high‑score endpoint”.

---

## Frontend Module Interaction Diagram

+-------------------+          +-------------------+
|   input.js        |  <--->   |  main.js          |
+-------------------+          +-------------------+
          ^                               |
          |                               v
+-------------------+          +-------------------+
|  player.js        |  <--->   |  renderer.js      |
+-------------------+          +-------------------+
          ^                               |
          |                               v
+-------------------+          +-------------------+
| bullets.js        |  <--->   |  enemies.js       |
+-------------------+          +-------------------+
          ^                               |
          |                               v
+-------------------+          +-------------------+
|  world.js         |  <--->   |  hud.js           |
+-------------------+          +-------------------+
          ^                               |
          |                               v
+-------------------+          +-------------------+
| humanoids.js      |  <--->   |  main.js          |
+-------------------+          +-------------------+

* `input.js` polls `keydown`/`keyup` events and exposes `isPressed(key)` utilities.  
* `player.js` reads the input state each tick, updates position, fires bullets, and tracks lives/bombs.  
* `bullets.js` manages an object pool; `enemies.js` and `humanoids.js` both consume bullets for collision detection.  
* `world.js` scrolls the background and wraps entities when they leave the visible area.  
* `hud.js` draws the score, lives, and bombs on the canvas each frame.  
* `renderer.js` contains low‑level drawing helpers (neon glow, particle trails) used by all visual modules.  
* `main.js` drives the overall state machine, advances the `requestAnimationFrame` loop, and calls `renderer.renderFrame()`.

All modules are written in ES6 module syntax (`export function …`) and are imported via relative paths from `main.js`.

---

## Unit Test Mapping

| Test file | Covered endpoint / module | Acceptance criteria exercised |
|-----------|--------------------------|--------------------------------|
| `defender/backend/tests/test_api.py` | `GET /`, `GET /static/{path}` | - Root returns HTML with `<canvas>`.<br>- Static assets are correctly served (status 200, correct MIME). |
| `defender/backend/tests/test_score.py` | `GET /score`, `POST /score` | - GET returns default `{ "high_score": 0 }` when no score stored.<br>- POST validates non‑negative integer, rejects malformed JSON (400).<br>- POST updates high‑score only when larger.<br>- GET after POST reflects the new high‑score. |
| (Manual) Frontend verification | Entire JS stack | - Canvas draws neon‑styled ship, enemies, bullets.<br>- Keyboard controls move ship, fire, activate smart‑bomb.<br>- Score increments per SPEC table (e.g., enemy kill = X points).<br>- Lives decrement on ship collision; game‑over screen appears when lives = 0. |

The backend tests are executed automatically by the QA harness (`pytest -q` inside `defender/backend`).  The manual frontend checks are not part of the automated suite but the architecture guarantees deterministic behaviour through clear module boundaries.

---

## Integration and Deployment Flow

   * The `--reload` flag allows hot‑reloading of Python files during development.  

---

## Acceptance Mapping

| SPEC Requirement | Architecture Provision |
|------------------|------------------------|
| Serve HTML with a canvas element at root | `defender/backend/main.py::root()` returns `defender/frontend/index.html` containing `<canvas id="game">`. |
| Correct static file serving | `defender/backend/main.py::static_files()` mounts `defender/frontend/` under `/static/`. |
| In‑memory high‑score endpoint with validation | `defender/backend/main.py` implements `/score` GET/POST with module‑level `high_score` variable and JSON schema validation. |
| Frontend modules (input, player, bullets, enemies, humanoids, world, hud, renderer, main) | Each listed file under `defender/frontend/game/` implements one responsibility; `main.js` glues them together via a state machine. |
| Scoring table and lives/bomb logic | `player.js` updates lives/bombs; `hud.js` displays them; `enemies.js` and `humanoids.js` award points per SPEC table (implemented as constants). |
| Python unit tests covering API behavior | `defender/backend/tests/test_api.py` and `test_score.py` verify all HTTP contract requirements. |
| No external persistence | Only a process‑local integer is stored; no DB or file writes. |
| 60 fps target on modern browsers | `main.js` uses `requestAnimationFrame`, which syncs to the browser’s refresh rate (typically 60 Hz). |
| Documentation and launch instructions | `defender/README.md` contains install, launch, and control cheat‑sheet per SPEC. |

All acceptance criteria are addressed without deviation from the SPEC‑defined filenames and routes.

---

## Delivery Phases

The SPEC defines a single development phase containing all required files.  The architecture lists each concrete path, ensuring that the implementation team (Polecat) can create the exact files under the `defender/` root.


No additional phases (e.g., database migration) are needed because the storage is in‑memory.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **High‑score loss on server restart** – may surprise players. | This is **by design** per SPEC (“in‑memory” endpoint).  Documented in README. |
| **Static file path mismatch** – tests could fail if `/static/` prefix is wrong. | Architecture explicitly describes the `/static/{path:path}` route and forces all static files to live under `defender/frontend/`. |
| **Keyboard handling conflicts** – multiple keys pressed simultaneously. | `input.js` tracks a map of pressed keys; all downstream modules query this map, ensuring a single source of truth. |
| **Performance degradation** – large object pools could cause GC pressure. | Modules use simple object literals; the pool size is bounded (e.g., max 200 bullets) to keep memory predictable. |
| **Browser compatibility** – ES6 modules not supported in older browsers. | Target browsers are modern (Chrome/Firefox/Edge) as implied by the 60 fps requirement; fallback not required by SPEC. |

---

## Glossary

| Term | Meaning |
|------|---------|
| **Static route** | FastAPI `StaticFiles` mount serving files under `/static/`. |
| **High‑score API** | POST/GET JSON endpoint at `/score`. |
| **State machine** | Game flow controller (title → intro → gameplay → death → game‑over). |
| **Neon style** | Visual theme using bright outlines and glow effects (implemented in `renderer.js`). |
| **Projectile pool** | Reusable bullet objects to avoid allocation each frame. |

---

## Conclusion

This architecture document fully enumerates the file layout, HTTP contract, data model, frontend module responsibilities, test coverage, and acceptance mapping for the **Defender Clone** rig `testgt1`.  By adhering strictly to the paths prefixed with the `defender/` root and the route definitions from the SPEC, the subsequent implementation step (by Polecat) can proceed with confidence that all required behavior is captured and verified.


