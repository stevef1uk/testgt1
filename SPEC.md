# Project Specification: Defender Clone (Web-Based) — Hands-Free Rig Edition

> **Edits for hands-free `rig-flow` (vs your draft):**
> - Added `Workflow & Delivery Contract` header so `gt rig spec-index` generates correct `delivery_phases` — your draft left this to LLM inference (caused `testgt3` rewinds where Tester flagged future-phase files).
> - Made **Playwright a required file + QA gate** (not stretch) — without it the Tester/QA have no automated frontend signal and the rig hangs waiting for manual browser play. Added `defender/package.json` + `playwright.config.js` + `defender/tests/e2e/game.spec.js` to `required_files`.
> - Split QA into two delivery phases (`backend` via `pytest`, `frontend` via `playwright`) so backend can go green even if npm is slow.
> - Kept your whole gameplay/API/layout spec verbatim below — only appended contract + per-file `package.json`/`playwright.config.js` requirements.

## Workflow & Delivery Contract (read by `gt rig spec-index`)

```
layout_root: defender
spec_summary: Defender clone — FastAPI serves HTML5 Canvas vanilla-JS game; scrolling world, 10 humanoids/wave, lander abduction, scoring + session high-score API.
required_files (full rig, for reference):
  - defender/README.md
  - defender/backend/main.py
  - defender/backend/requirements.txt
  - defender/backend/tests/test_api.py
  - defender/backend/tests/test_score.py
  - defender/package.json
  - defender/playwright.config.js
  - defender/tests/e2e/game.spec.js
  - defender/frontend/index.html
  - defender/frontend/style.css
  - defender/frontend/game/main.js
  - defender/frontend/game/input.js
  - defender/frontend/game/player.js
  - defender/frontend/game/enemies.js
  - defender/frontend/game/humanoids.js
  - defender/frontend/game/bullets.js
  - defender/frontend/game/world.js
  - defender/frontend/game/hud.js
  - defender/frontend/game/renderer.js
delivery_phases:
  - id: backend
    title: backend
    required_files:
      - defender/backend/main.py
      - defender/backend/requirements.txt
      - defender/backend/tests/test_api.py
      - defender/backend/tests/test_score.py
    qa_verify_command: "cd defender/backend && python3 -m pip install -r requirements.txt -q && python3 -m pytest -q"
    depends_on: []
  - id: frontend
    title: frontend
    required_files:
      - defender/package.json
      - defender/playwright.config.js
      - defender/tests/e2e/game.spec.js
      - defender/frontend/index.html
      - defender/frontend/style.css
      - defender/frontend/game/main.js
      - defender/frontend/game/input.js
      - defender/frontend/game/player.js
      - defender/frontend/game/enemies.js
      - defender/frontend/game/humanoids.js
      - defender/frontend/game/bullets.js
      - defender/frontend/game/world.js
      - defender/frontend/game/hud.js
      - defender/frontend/game/renderer.js
    qa_verify_command: "cd defender && npm install --ignore-scripts -q && npx playwright install chromium --with-deps -q 2>&1 | tail -n 5; npx playwright test --reporter=list"
    depends_on: [backend]
  # Optional smoke combines both — QA runs only the active phase's command, so backend stays fast
active_phase_id: backend
```

**Test runner:** `backend` → `pytest` (httpx/TestClient). `frontend` → `playwright` (chromium only, no UI). Polecat must keep both green; `bd close` requires the file for that bead exists + its phase's `qa_verify_command` passes.

**Backend start (from `defender/backend/`):** `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
**Frontend serve:** via backend `GET /` and `GET /static/{path}` — no separate dev server.

---

## Overview

A browser-based arcade shooter inspired by the 1981 Defender arcade game, built with a **Python FastAPI backend** and an **HTML5 Canvas + vanilla JavaScript** frontend. The player defends humanoids from alien abduction over a horizontally scrolling world. Target: fun, playable, 60fps, keyboard-only, single session (no accounts, no database).

## Goals

- Deliver a playable Defender-inspired game in the browser
- Lightweight backend: serve static files + optional in-memory session high score API
- Vanilla JS only (no Phaser, no build step required for basic play via backend)
- Keyboard-only controls; single player
- Code split into logical modules under `defender/` (see layout below)

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11+, **FastAPI**, Uvicorn |
| Frontend | HTML5, vanilla JavaScript, CSS |
| Rendering | HTML5 Canvas 2D |
| Transport | REST JSON over HTTP |
| Backend tests | **pytest**, httpx, FastAPI `TestClient` |
| Frontend e2e | **Playwright** + chromium (required for hands-free QA) |
| Frontend unit tests | Vitest + jsdom (optional stretch; not required for polecat MVP) |

No database. Game state lives in the browser. Backend holds optional session high score in memory only.

## Layout root: `defender/`

All implementation paths are **relative to `defender/`** in the mayor/rig worktree.

```
defender/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── requirements.txt     # Package names only (pytest, httpx, fastapi, uvicorn)
│   └── tests/
│       ├── test_api.py      # GET /, static routes
│       └── test_score.py    # POST/GET /score
├── frontend/
│   ├── index.html           # Shell: canvas, script tags, title/game screens
│   ├── style.css            # Dark/neon layout
│   └── game/
│       ├── main.js          # Entry: game loop, screen state machine
│       ├── input.js         # Keyboard map
│       ├── player.js        # Ship movement, fire, smart bomb, lives
│       ├── enemies.js       # Lander, Mutant, Bomber, Swarmer, Baiter
│       ├── humanoids.js     # Ground humanoids, abduction, rescue
│       ├── bullets.js       # Projectiles, pooling, culling
│       ├── world.js         # Scrolling/wrapping world, terrain, parallax stars
│       ├── hud.js           # Score, wave, lives, bombs, minimap
│       └── renderer.js      # Canvas draw (neon style, particles)
├── package.json             # npm: playwright + http-server helper (no build step)
├── playwright.config.js     # webServer: uvicorn on 8000, baseURL http://localhost:8000
├── tests/
│   └── e2e/
│       └── game.spec.js     # Playwright: title → game, move/fire, score HUD changes
└── README.md
```

## Gameplay summary

- Horizontally scrolling world (wider than viewport, wraps). Camera follows player.
- 10 humanoids per wave on terrain. Landers abduct; player shoots enemies and can rescue falling humanoids.
- If all humanoids are lost, mutants spawn. Waves escalate speed/spawn rate.
- Screens: Title → Game → Wave intro → (death slow-mo) → Game over → restart without full reload.
- **Controls:** A/D or arrows (move), W/S (vertical), Space (fire), Enter (smart bomb), P (pause), Escape (menu).

## Scoring (implement in `game/` + optional POST to backend)

| Event | Points |
|-------|--------|
| Lander / Mutant / Swarmer destroyed | 150 |
| Bomber destroyed | 250 |
| Baiter destroyed | 200 |
| Rescued humanoid (mid-air catch) | 500 |
| Humanoid safe on ground | 250 |
| Wave complete | 100 × wave number |
| Bonus life | Every 10,000 points |

## Backend API (FastAPI)

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/` | Serve `frontend/index.html` |
| GET | `/static/{path}` | Serve JS/CSS under `frontend/` |
| POST | `/score` | Body `{ "score": int, "wave": int }` — update session high score only if higher |
| GET | `/score` | `{ "score": int, "wave": int }` — default `{0,0}` if none |

Start command (from `defender/backend/`): `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

## Visual style

- Dark space + starfield; terrain silhouette (purple/grey)
- Neon palette: cyan player, green humanoids, red/orange enemies
- `shadowBlur` glow; particle bursts on kills/death
- 60fps via `requestAnimationFrame`

## Polecat implementation requirements

Implement **real, runnable code** — not placeholders (`console.log` only, empty HTML, `pass`, or shell commands pasted into `.py` files). Each bead title path must match a file below.

### Per-file minimum acceptance

**`backend/requirements.txt`** — lines: `fastapi`, `uvicorn[standard]`, `httpx`, `pytest` (pins optional).

**`backend/main.py`** — FastAPI app: routes above, `StaticFiles` or equivalent for `../frontend`, in-memory high score dict. Must pass `backend/tests/`.

**`backend/tests/test_api.py`** — `TestClient`: GET `/` returns 200 and HTML containing `canvas` or game root.

**`backend/tests/test_score.py`** — POST valid/invalid score, GET default and after POST, high score only increases when higher.

**`package.json`** — `{ "type": "module", "scripts": { "test": "playwright test" }, "devDependencies": { "@playwright/test": "^1.44.0" } }` — no bundler, no build step. `npm install --ignore-scripts` must succeed offline after first fetch.

**`playwright.config.js`** — `webServer: { command: "python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000", cwd: "./", timeout: 30000, reuseExistingServer: true }`, `use: { baseURL: "http://127.0.0.1:8000" }`, `projects: [{ name: "chromium", use: { browserName: "chromium" } }]`, `timeout: 30000`. Must NOT require `npm run build`.

**`tests/e2e/game.spec.js`** — at least 2 tests: (1) `GET /` loads and `canvas` is visible + title screen text; (2) start game via `Enter`/`Space`, assert HUD score element exists and keyboard input does not throw. Keep deterministic — no `waitForTimeout` > 2s, use `toBeVisible()` and `keyboard.press()`.

**`frontend/index.html`** — Fullscreen canvas, loads `style.css` and game scripts in order (`input` → … → `main.js`), hidden screens or overlays for title/game over.

**`frontend/style.css`** — Dark background, positions canvas and HUD regions.

**`frontend/game/input.js`** — Key state map for all controls listed above.

**`frontend/game/player.js`** — Ship position, velocity, bounds, fire cooldown, 3 lives, smart bomb count, facing for bullet direction.

**`frontend/game/bullets.js`** — Create/update/remove bullets; max count; off-screen cull.

**`frontend/game/enemies.js`** — Spawn tables per wave; types: Lander, Mutant (when no humanoids), Bomber, Swarmer, Baiter (if wave too long); basic movement toward targets.

**`frontend/game/humanoids.js`** — 10 humanoids on terrain; abduction state; fall + rescue collision with player.

**`frontend/game/world.js`** — World width ≈ 5× viewport; horizontal wrap; terrain height map per wave; parallax stars.

**`frontend/game/hud.js`** — Draw score, wave, lives, bombs; minimap strip showing entities.

**`frontend/game/renderer.js`** — Draw terrain, entities, particles; neon colors.

**`frontend/game/main.js`** — Wire modules: `requestAnimationFrame` loop, screen FSM (title/game/wave/death/gameover), wave progression, call renderer/hud, **≥200 lines of real logic** (not comments only).

**`README.md`** — How to install (`pip install -r backend/requirements.txt`), run uvicorn, open browser URL, controls table. Also note `npm install && npx playwright test` for QA.

### Verification before `bd close`

From `defender/backend/` (with venv if used):

```bash
python3 -m pip install -r requirements.txt -q
python3 -m pytest -q
```

From `defender/` (frontend gate, runs only on `frontend` phase):

```bash
npm install --ignore-scripts -q
npx playwright install chromium --with-deps -q 2>&1 | tail -n 5
npx playwright test --reporter=list
```

From browser (manual): backend running, play title → game, move and fire, score changes.

Do **not** close implementation beads until the file for that bead exists, is non-stub, and the *active phase's* `qa_verify_command` passes (backend files → `pytest`, frontend files → `playwright`).

## Testing scope for automated rig QA

**Required for workflow pass:**
- `backend` phase: `pytest -q` from `defender/backend/` (all tests green).
- `frontend` phase: `playwright test` from `defender/` (chromium, both specs green). QA runs only the *active* phase's command, so backend stays fast until frontend lands.

### Backend pytest cases (must exist)

- GET `/` → 200, HTML
- POST `/score` valid → 200; invalid → 422
- GET `/score` after POST returns stored values; default zeros when empty
- High score only updates when new score is greater

### Frontend Playwright cases (must exist, deterministic)

- `tests/e2e/game.spec.js` — title canvas visible; pressing `Enter` transitions to game screen; firing/collecting does not throw; HUD score element updates.
- No external network, no `waitForTimeout` flakes, webServer starts `uvicorn` on 8000.

## Out of scope

- Mobile/touch, multiplayer, persistent leaderboards, accounts
- Sound/music (optional)
- External game engines (Phaser, etc.)

## Success criteria (definition of done)

1. `uvicorn` serves game; browser play without console errors
2. Player movement, firing, enemies spawning, humanoid abduction/rescue recognizable
3. HUD + minimap reflect state
4. Score and lives behave per table; game over and restart work
5. `pytest` in `defender/backend/` passes **and** `playwright` in `defender/` passes
6. All paths in layout exist with substantive code (no stub-only files)

