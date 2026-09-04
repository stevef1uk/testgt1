

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
    qa_verify_command: "cd defender && npm install --ignore-scripts -q"
    depends_on: [backend]
  - id: integration-test
    title: integration-test
    required_files:
      - defender/package.json
      - defender/playwright.config.js
      - defender/tests/e2e/game.spec.js
    qa_verify_command: "cd defender && docker-compose run --rm playwright"
    depends_on: [frontend]
active_phase_id: backend
```

**Test runner:** `backend` → `pytest` (httpx/TestClient). `frontend` → `npm install` only (Playwright moves to the `integration-test` phase). `integration-test` → `docker-compose run --rm playwright` (chromium only, no UI, in the shared `playwright-go-test:latest` runner). Polecat must keep each phase green; `bd close` requires the file for that bead exists + its phase's `qa_verify_command` passes.

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
├── docker-compose.yml       # Playwright + app compose (host-run kind)
├── Dockerfile.playwright    # Playwright stage for E2E tests
├── package.json             # npm: playwright + http-server helper (no build step)
├── playwright.config.js     # webServer: uvicorn on 8000, baseURL http://host.docker.internal:8000
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
