/**
 * main.js — Game entry point, FSM, requestAnimationFrame loop
 *
 * Screens / states:
 *   title → playing → wave-intro → death → game-over → title
 *
 * Controls:
 *   A/D or ArrowLeft/ArrowRight  — horizontal thrust
 *   W/S or ArrowUp/ArrowDown     — vertical thrust
 *   Space                        — fire
 *   Enter                        — smart bomb
 *   P                            — pause / unpause
 *   Escape                       — return to title
 */

import { initInput, keys } from './input.js';
import { createWorld, updateWorld, WORLD_WIDTH } from './world.js';
import { createPlayer, updatePlayer, useSmartBomb } from './player.js';
import { createBulletPool, fireBullet, updateBullets, clearBullets } from './bullets.js';
import { createEnemyWave, updateEnemies, checkBulletEnemyCollisions } from './enemies.js';
import { createHumanoids, updateHumanoids, countAlive } from './humanoids.js';
import { drawHUD } from './hud.js';
import {
  clearBackground,
  drawPlayer,
  drawBullets,
  drawEnemies,
  drawHumanoids,
  drawTerrain,
  drawMinimap,
} from './renderer.js';

// ── Constants ────────────────────────────────────────────────────────────────

const HUMANOIDS_PER_WAVE = 10;
const BONUS_LIFE_THRESHOLD = 10000;
const FIRE_COOLDOWN_MS = 150;
const WAVE_INTRO_DURATION_MS = 2500;
const DEATH_SLOW_DURATION_MS = 2000;
const TITLE_SCREEN_DURATION_MS = 3000;
const MAX_LIVES = 3;
const FPS = 60;
const MS_PER_FRAME = 1000 / FPS;

// ── Game State ───────────────────────────────────────────────────────────────

const State = {
  TITLE: 'title',
  PLAYING: 'playing',
  WAVE_INTRO: 'wave-intro',
  DEATH: 'death',
  GAME_OVER: 'game-over',
};

let game = {
  state: State.TITLE,
  lastTimestamp: 0,
  dtAccumulator: 0,
  score: 0,
  lives: MAX_LIVES,
  wave: 0,
  pause: false,
};

// ── Canvas & Context ───────────────────────────────────────────────────────

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = WORLD_WIDTH;
canvas.height = canvas.width; // square canvas for simplicity

// ── Initialization ────────────────────────────────────────────────────────

function initGame() {
  initInput();
  game.world = createWorld();
  game.player = createPlayer();
  game.bullets = createBulletPool();
  game.enemies = createEnemyWave();
  game.humanoids = createHumanoids(HUMANOIDS_PER_WAVE);
  clearBullets(game.bullets);
  game.lastFireTime = 0;
  game.state = State.TITLE;
  game.titleTimer = TITLE_SCREEN_DURATION_MS;
}

// ── Main Loop ───────────────────────────────────────────────────────────────

function gameLoop(timestamp) {
  if (!game.lastTimestamp) game.lastTimestamp = timestamp;
  const delta = timestamp - game.lastTimestamp;
  game.lastTimestamp = timestamp;
  game.dtAccumulator += delta;

  while (game.dtAccumulator >= MS_PER_FRAME) {
    update(MS_PER_FRAME);
    game.dtAccumulator -= MS_PER_FRAME;
  }

  render();
  requestAnimationFrame(gameLoop);
}

// ── Update Logic ─────────────────────────────────────────────────────────---

function update(dt) {
  if (game.pause) return;

  switch (game.state) {
    case State.TITLE:
      handleTitle(dt);
      break;
    case State.PLAYING:
      handlePlaying(dt);
      break;
    case State.WAVE_INTRO:
      handleWaveIntro(dt);
      break;
    case State.DEATH:
      handleDeath(dt);
      break;
    case State.GAME_OVER:
      handleGameOver(dt);
      break;
  }

  // Global controls
  if (keys['Escape']) {
    game.state = State.TITLE;
    initGame();
  }
  if (keys['KeyP']) {
    game.pause = !game.pause;
  }
}

// ── State Handlers ──────────────────────────────────────────────────────────

function handleTitle(dt) {
  game.titleTimer -= dt;
  if (game.titleTimer <= 0) {
    game.state = State.PLAYING;
  }
}

function handlePlaying(dt) {
  updateWorld(game.world, dt);
  updatePlayer(game.player, keys, dt);
  updateBullets(game.bullets, dt);
  updateEnemies(game.enemies, dt);
  updateHumanoids(game.humanoids, dt);
  checkBulletEnemyCollisions(game.bullets, game.enemies, (pts) => {
    game.score += pts;
    if (game.score >= BONUS_LIFE_THRESHOLD && game.lives < MAX_LIVES) {
      game.lives++;
    }
  });

  if (keys['Space'] && performance.now() - game.lastFireTime >= FIRE_COOLDOWN_MS) {
    fireBullet(game.bullets, game.player);
    game.lastFireTime = performance.now();
  }
  if (keys['Enter']) {
    useSmartBomb(game.bullets, game.enemies, game.humanoids);
  }

  if (countAlive(game.humanoids) === 0) {
    game.state = State.WAVE_INTRO;
    game.waveTimer = WAVE_INTRO_DURATION_MS;
  }

  if (!game.player.alive) {
    game.state = State.DEATH;
    game.deathTimer = DEATH_SLOW_DURATION_MS;
  }
}

function handleWaveIntro(dt) {
  game.waveTimer -= dt;
  if (game.waveTimer <= 0) {
    game.wave++;
    game.humanoids = createHumanoids(HUMANOIDS_PER_WAVE + game.wave * 2);
    game.state = State.PLAYING;
  }
}

function handleDeath(dt) {
  game.deathTimer -= dt;
  if (game.deathTimer <= 0) {
    game.lives--;
    if (game.lives > 0) {
      game.player = createPlayer();
      game.state = State.PLAYING;
    } else {
      game.state = State.GAME_OVER;
    }
  }
}

function handleGameOver(dt) {
  fetch('/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score: game.score }),
  }).catch(() => {});
}

// ── Rendering ───────────────────────────────────────────────────────────────

function render() {
  clearBackground(ctx);
  drawTerrain(ctx, game.world);
  drawMinimap(ctx, game.world);
  drawHumanoids(ctx, game.humanoids);
  drawEnemies(ctx, game.enemies);
  drawBullets(ctx, game.bullets);
  drawPlayer(ctx, game.player);
  drawHUD(ctx, {
    score: game.score,
    lives: game.lives,
    wave: game.wave,
    state: game.state,
    paused: game.pause,
  });
}

// ── Start ───────────────────────────────────────────────────────────────────

initGame();
requestAnimationFrame(gameLoop);