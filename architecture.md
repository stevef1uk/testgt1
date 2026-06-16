# Architecture for testgt1 — Defender Clone

## Overview

The Defender Clone project delivers a browser-based arcade shooter inspired by the 1981 Defender arcade game. It uses a **Python FastAPI** backend and a **vanilla JavaScript + HTML5 Canvas** frontend. All source files live under the `defender/` directory. The backend serves static frontend files and provides an in-memory high-score API. The frontend implements full game logic: scrolling world, player ship, bullets, enemies, humanoids, and a HUD — all running at 60 fps in a requestAnimationFrame loop.

No database, no user accounts, no build tools. The entire frontend is plain ES6 modules loaded directly by the browser.

---

## Planned file layout

defender/
├── README.md
├── backend/
│   ├── main.py                    # FastAPI app: static mount + /score endpoint
│   ├── requirements.txt           # fastapi, uvicorn, httpx, pytest
│   └── tests/
│       ├── test_api.py            # Tests: root returns HTML with <canvas>, static files served
│       └── test_score.py         # Tests: POST /score validates, stores max; GET /score defaults
└── frontend/
    ├── index.html                 # Fullscreen canvas, loads game/main.js as module
    ├── style.css                  # Dark neon styling, fullscreen canvas rules
    └── game/
        ├── main.js                # Game entry point, FSM, requestAnimationFrame loop
        ├── renderer.js            # Neon-styled canvas drawing routines
        ├── hud.js                 # Score, lives, bombs display on canvas
        ├── input.js               # Keyboard state tracker
        ├── player.js              # Ship movement, smart bomb logic
        ├── bullets.js             # Bullet spawn, update, lifecycle
        ├── enemies.js             # Wave-based enemy spawning and AI
        ├── humanoids.js           # Abductable humanoid targets
        └── world.js               # Scrolling wrap-around world state

---

## HTTP API routes

| Method | Path | Request body | Response | Description |
|--------|------|--------------|----------|-------------|
| GET | `/` | — | `text/html` (index.html) | Serve the game frontend |
| GET | `/static/{file_path:path}` | — | static file bytes | Serve CSS, JS, assets |
| GET | `/score` | — | `{"high_score": int, "initials": str}` | Return current session high score |
| POST | `/score` | `{"score": int, "initials": str}` | `{"high_score": int, "initials": str}` | Submit score; stored only if higher than current |

### Backend implementation notes — `defender/backend/main.py`

- `StaticFiles` mounted at `/static` pointing to `../frontend` directory so the browser can load `style.css` and the `game/` JS modules.
- `POST /score` validates that `score` is a non-negative integer and `initials` is a non-empty string (max 3 chars). Returns 422 on invalid input. Updates `_state` only when submitted score exceeds current `high_score`.
- `GET /score` returns `_state` directly.

---

## Frontend JavaScript module architecture

### `defender/frontend/index.html`


### `defender/frontend/game/input.js`

Exports:
- `const keys = {}` — live map of `event.key → boolean`.
- `function initInput()` — attaches `keydown`/`keyup` listeners to `window`, populating `keys`.

### `defender/frontend/game/world.js`

Exports:
- `const WORLD_WIDTH` — total logical world width (e.g. 8000px).
- `function createWorld()` — returns world state object `{ cameraX, wrap }`.
- `function updateWorld(world, playerX)` — scrolls camera to follow player with wrap-around.

### `defender/frontend/game/player.js`

Exports:
- `function createPlayer()` — returns player state `{ x, y, vx, vy, lives, bombs, facing }`.
- `function updatePlayer(player, keys, world, dt)` — applies thrust, gravity, wrap, facing direction.
- `function useSmartBomb(player, enemies, humanoids)` — detonates bomb, clears on-screen enemies, decrements `player.bombs`.

### `defender/frontend/game/bullets.js`

Exports:
- `function createBulletPool()` — returns `[]`.
- `function fireBullet(bullets, player)` — pushes a new bullet `{ x, y, vx, active }`.
- `function updateBullets(bullets, dt)` — advances positions, deactivates out-of-bounds.
- `function clearBullets(bullets)` — empties the pool (used on wave reset).

### `defender/frontend/game/enemies.js`

Exports:
- `function createEnemyWave(waveNumber)` — returns array of enemy objects with type, position, AI state.
- `function updateEnemies(enemies, player, humanoids, dt)` — runs AI, movement, abduction logic.
- `function checkBulletEnemyCollisions(bullets, enemies, scoreRef)` — resolves hits, increments score.

### `defender/frontend/game/humanoids.js`

Exports:
- `function createHumanoids(count)` — returns array of humanoid objects `{ x, y, alive, captured }`.
- `function updateHumanoids(humanoids, enemies, dt)` — handles abduction state machine.
- `function countAlive(humanoids)` — returns number of surviving humanoids.

### `defender/frontend/game/hud.js`

Exports:
- `function drawHUD(ctx, score, lives, bombs, wave)` — draws score, lives icons, bomb count, and wave number onto the canvas using `ctx` drawing calls. All values passed in as plain arguments — no global state accessed by HUD.

### `defender/frontend/game/renderer.js`

Exports:
- `function clearBackground(ctx, canvas)` — fills canvas with deep-space black.
- `function drawPlayer(ctx, player, world)` — draws the neon ship sprite using canvas path operations.
- `function drawBullets(ctx, bullets, world)` — draws active bullets.
- `function drawEnemies(ctx, enemies, world)` — draws each enemy type with neon color.
- `function drawHumanoids(ctx, humanoids, world)` — draws humanoids on terrain.
- `function drawTerrain(ctx, world, canvas)` — draws the scrolling landscape.
- `function drawMinimap(ctx, player, enemies, humanoids, canvas)` — draws the radar/minimap overlay.

All drawing functions accept `ctx` (CanvasRenderingContext2D) as the first argument and use native canvas path/arc/rect/fillText calls. No functions with single-word capitalised names like `To`, `JS`, `Path`, `Background`, `Player`, `Humanoids` — all exports use full descriptive names above.

### `defender/frontend/game/main.js`

Responsibilities:

---

## Scoring table

| Event | Points |
|-------|--------|
| Shoot enemy (lander) | 150 |
| Shoot mutant | 150 |
| Shoot bomber | 250 |
| Shoot pod | 1000 |
| Shoot swarmer | 150 |
| Rescue humanoid | 500 |
| Humanoid lands safely (wave clear) | 250 |

---

## Backend tests

### `defender/backend/tests/test_api.py`
- `test_root_returns_html` — GET `/` returns 200, Content-Type includes `text/html`, body contains `<canvas`.
- `test_static_css` — GET `/static/style.css` returns 200.
- `test_static_js` — GET `/static/game/main.js` returns 200.

### `defender/backend/tests/test_score.py`
- `test_get_score_default` — GET `/score` returns `{"high_score": 0, "initials": ""}`.
- `test_post_score_updates` — POST `/score` `{"score": 1000, "initials": "ACE"}` returns 200 with `high_score: 1000`.
- `test_post_score_does_not_decrease` — POST a lower score after higher; high_score unchanged.
- `test_post_score_invalid` — POST `{"score": -1, "initials": "X"}` returns 422.
- `test_post_score_empty_initials` — POST `{"score": 100, "initials": ""}` returns 422.

---

## Integration and testing

# Install dependencies
pip install -r defender/backend/requirements.txt

# Run backend tests
cd defender/backend && pytest -q

# Start the server
cd defender/backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Frontend verification is manual: open `http://localhost:8000/` in a browser and confirm the game canvas loads, title screen appears, and gameplay is functional.

---

## Acceptance mapping

| SPEC goal | Architecture solution |
|-----------|----------------------|
| Playable game in browser | FSM in main.js drives title/gameplay/death/game-over flow |
| 60fps | requestAnimationFrame loop with dt-based updates |
| Keyboard-only controls | input.js tracks key state; player.js reads keys map |
| Scrolling wrap-around world | world.js maintains cameraX; renderer uses world offset |
| Humanoid abduction mechanic | humanoids.js + enemies.js abduction state machine |
| Smart bombs | player.js useSmartBomb clears enemies |
| High score API | FastAPI /score GET+POST with in-memory store |
| Static file serving | FastAPI StaticFiles mount at /static |
| No build tools | Plain ES6 modules loaded directly by browser |
| Backend tests pass | pytest test_api.py + test_score.py cover all routes |
