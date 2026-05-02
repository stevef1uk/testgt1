# Project Specification: Defender Clone (Web-Based)

## Overview

A browser-based arcade shooter inspired by the 1981 Defender arcade game, built with a Python backend and an HTML/JS frontend. The game retains the core feel of the original — a horizontally scrolling shooter where the player defends humanoids from alien abduction — but with modern visual polish and quality-of-life improvements.

---

## Goals

- Deliver a fun, playable Defender-inspired game running entirely in the browser
- Keep the architecture simple: a lightweight Python backend serving static files and a game state/score API
- Use a scrolling canvas-based game rendered in vanilla HTML5 Canvas + JavaScript
- Keyboard-only controls
- Single player, no accounts or persistence beyond the current session

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Python 3.11+ with FastAPI         |
| Frontend  | HTML5, Vanilla JavaScript, CSS    |
| Rendering | HTML5 Canvas API                  |
| Transport | REST (JSON) over HTTP             |
| packaging | Uvicorn (ASGI server)             |

No database is required. All game state is held in the browser. The backend is responsible only for serving the frontend and optionally validating/storing the session high score in memory.

---

## Project Structure

```
defender/
├── backend/
│   ├── main.py          # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── index.html       # Game shell
│   ├── style.css        # Minimal UI styling
│   └── game/
│       ├── main.js      # Entry point, game loop
│       ├── player.js    # Player ship logic
│       ├── enemies.js   # Enemy types and AI
│       ├── humanoids.js # Humanoid logic
│       ├── bullets.js   # Projectile management
│       ├── world.js     # Scrolling world / terrain
│       ├── hud.js       # Heads-up display (score, lives, minimap)
│       ├── renderer.js  # Canvas draw calls
│       └── input.js     # Keyboard input handler
└── README.md
```

---

## Gameplay

### Core Loop

The player pilots a ship over a horizontally scrolling alien landscape. Waves of enemies spawn and attempt to abduct humanoids standing on the terrain below. The player must shoot enemies and rescue falling humanoids before they are carried off screen. Waves increase in difficulty. The game ends when all lives are lost.

### Modern Touches (departures from the original)

- Smooth 60fps rendering using `requestAnimationFrame`
- Particle effects on explosions
- Glowing neon visual style rather than raw vector graphics
- Enemy variety with distinct visual designs
- Brief screen-flash and slow-motion effect on player death
- A wave intro banner displayed between waves
- Difficulty scaling: enemy speed, spawn rate, and aggression increase each wave

---

## Game Entities

### Player Ship

- Moves left/right and can thrust up/down within vertical bounds
- Fires bullets horizontally in the direction it is facing
- Has a smart bomb ability (screen-clear, limited uses)
- Starts with 3 lives; gains a bonus life every 10,000 points

### Humanoids

- Stand on the terrain; there are 10 per wave
- If all humanoids are abducted, mutants spawn (faster, aggressive enemies)
- Player can catch a falling humanoid (after killing its abductor) to score bonus points

### Enemies

| Enemy      | Behaviour                                              |
|------------|--------------------------------------------------------|
| Lander     | Descends to grab humanoids, shoots at player           |
| Mutant     | Fast, homing; spawns when all humanoids are abducted   |
| Bomber     | Drops mines across the terrain                         |
| Swarmer    | Appears in groups, erratic movement                    |
| Baiter     | Spawns if a wave takes too long; fast and aggressive   |

---

## Controls (Keyboard Only)

| Key            | Action                        |
|----------------|-------------------------------|
| `A` / `←`      | Thrust left                   |
| `D` / `→`      | Thrust right                  |
| `W` / `↑`      | Thrust up                     |
| `S` / `↓`      | Thrust down                   |
| `Space`        | Fire                          |
| `Enter`        | Smart bomb                    |
| `P`            | Pause / unpause               |
| `Escape`       | Quit to main menu             |

---

## Scoring

| Event                          | Points  |
|--------------------------------|---------|
| Shooting a Lander              | 150     |
| Shooting a Mutant              | 150     |
| Shooting a Bomber              | 250     |
| Shooting a Swarmer             | 150     |
| Shooting a Baiter              | 200     |
| Catching a rescued humanoid    | 500     |
| Humanoid safely on ground      | 250     |
| Completing a wave              | 100 × wave number |

Score is displayed in the HUD and persists for the duration of the browser session only.

---

## HUD (Heads-Up Display)

- **Top left:** Current score
- **Top centre:** Wave number
- **Top right:** Lives remaining (ship icons) and smart bomb count
- **Bottom:** Minimap — a condensed horizontal view of the full world showing player position, humanoids, and enemies

---

## World / Terrain

- The world is wider than the viewport (e.g. 5× screen width) and wraps horizontally
- Procedurally generated terrain silhouette per wave (simple height-map)
- The camera follows the player ship, scrolling the world underneath
- Stars in the background scroll at a parallax rate slower than the terrain

---

## Screens

1. **Title Screen** — Game title, "Press Enter to Start", brief control reminder
2. **Game Screen** — Main gameplay with HUD
3. **Wave Intro** — Brief full-screen banner: "WAVE X" with a short pause
4. **Death Screen** — Slow-motion explosion, brief pause, then life lost and respawn
5. **Game Over Screen** — Final score, "Press Enter to Play Again"

---

## Backend API (FastAPI)

The backend is minimal. Its primary job is to serve the frontend. Optionally it exposes a lightweight in-memory score endpoint for the session.

### Endpoints

| Method | Path             | Description                              |
|--------|------------------|------------------------------------------|
| `GET`  | `/`              | Serves `index.html`                      |
| `GET`  | `/static/{file}` | Serves JS, CSS, and asset files          |
| `POST` | `/score`         | Accepts `{ "score": int, "wave": int }` and stores in memory |
| `GET`  | `/score`         | Returns the current session high score   |

The score endpoints are optional and can be omitted if the LLM chooses to keep everything client-side.

---

## Visual Style

- Dark space background with a subtle star field
- Neon colour palette: cyan player ship, green humanoids, red/orange enemies
- Particle explosions on enemy and player death
- Glow effects using Canvas `shadowBlur`
- Terrain rendered as a solid silhouette in dark purple/grey

---

## Non-Functional Requirements

- The game must run at a stable 60fps on a modern desktop browser
- No external JavaScript libraries or game engines — vanilla JS only
- No build step required; the frontend should work by simply opening `index.html` or being served by the backend
- Code should be clearly commented and split into logical modules as shown in the project structure
- The backend should start with a single command: `uvicorn main:app --reload`

---

## Testing

### Backend Tests (Python — pytest)

Located in `backend/tests/`. Run with:
```bash
pytest
```

| Test File                  | What it covers                                                                 |
|----------------------------|--------------------------------------------------------------------------------|
| `test_api.py`              | FastAPI endpoint tests using `httpx` / `TestClient`                            |
| `test_score.py`            | Score submission, retrieval, and in-memory state                               |

#### Specific backend test cases

- `GET /` returns HTTP 200 and valid HTML
- `POST /score` with valid payload `{ "score": 1500, "wave": 3 }` returns HTTP 200
- `POST /score` with missing or invalid fields returns HTTP 422
- `GET /score` returns the correct high score after a `POST`
- `GET /score` returns a sensible default (e.g. `{ "score": 0, "wave": 0 }`) when no score has been posted
- High score is only updated if the new score is higher than the stored one

---

### Frontend Tests (JavaScript — Vitest or Jest)

Located in `frontend/tests/`. Run with:
```bash
npm test
```

No browser required — logic modules are tested in isolation using JSDOM.

| Test File                  | What it covers                                                                 |
|----------------------------|--------------------------------------------------------------------------------|
| `test_player.js`           | Player movement, bounds clamping, bullet firing rate                           |
| `test_enemies.js`          | Enemy spawning, AI state transitions, mutant trigger condition                 |
| `test_humanoids.js`        | Abduction logic, rescue detection, mutant spawn when all humanoids are gone    |
| `test_bullets.js`          | Bullet creation, movement, out-of-bounds culling                               |
| `test_scoring.js`          | Score increments for each event type, bonus life threshold                     |
| `test_world.js`            | Terrain generation produces valid height map, world wrapping                   |
| `test_collision.js`        | Bullet-enemy, bullet-player, ship-humanoid collision detection                 |

#### Specific frontend test cases

**Player**
- Ship moves left/right correctly each tick
- Ship is clamped to vertical world bounds
- Firing is rate-limited (cannot fire faster than the defined cooldown)
- Smart bomb count decrements on use and cannot go below zero

**Enemies**
- Lander descends toward nearest humanoid when in range
- Mutants spawn only when humanoid count reaches zero
- Baiter spawns after a configurable time threshold within a wave
- Enemy list is culled correctly when an enemy is destroyed

**Humanoids**
- Humanoid is marked as `abducted` when a Lander reaches it
- Falling humanoid is marked as `rescued` when player collides with it mid-air
- Humanoid safely landing after rescue increments score correctly

**Collision**
- Bullet hitting an enemy removes the enemy and the bullet
- Bullet hitting the player decrements lives
- No false positives for entities far apart

**Scoring**
- Each enemy type awards the correct points on destruction
- Bonus life is awarded at exactly 10,000 points
- Wave completion bonus scales correctly with wave number

**World**
- Generated terrain height map has the correct number of segments
- World wraps: an x position beyond world width correctly maps back to 0

---

### End-to-End / Smoke Test (Optional)

Using **Playwright** to verify the game loads and renders in a real browser:

```bash
npx playwright test
```

| Test                        | What it checks                                              |
|-----------------------------|-------------------------------------------------------------|
| `test_launch.spec.js`       | Page loads, canvas element is present, no console errors    |
| `test_start_game.spec.js`   | Pressing Enter on title screen transitions to game screen   |
| `test_pause.spec.js`        | Pressing P pauses and unpauses the game                     |

---

### Testing Dependencies

Add to `backend/requirements.txt`:
```
pytest
httpx
```

Add to `frontend/package.json` devDependencies:
```json
{
  "vitest": "^1.0.0",
  "jsdom": "^24.0.0",
  "@playwright/test": "^1.40.0"
}
```

---

## Out of Scope

- Mobile / touch controls
- Multiplayer
- Persistent leaderboards or user accounts
- Sound / music (nice to have but not required)
- Any external game framework (Phaser, Pygame, etc.)

---

## Deliverables

- Fully playable game served via the FastAPI backend
- All source files organised as per the project structure above
- A `README.md` with setup and run instructions
- `requirements.txt` for the Python dependencies

---

## Success Criteria

- The game launches and is playable from the browser with no errors
- All enemy types spawn and behave as described
- Humanoid abduction and rescue mechanics work correctly
- The minimap accurately reflects world state
- Score increments correctly and persists across waves in a single session
- The game ends gracefully and allows restart without a page reload
