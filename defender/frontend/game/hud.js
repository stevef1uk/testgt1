/**
 * hud.js — Score, lives, bombs display on canvas
 * Renders the HUD overlay: current score, high score, lives, and smart bombs.
 */

const HUD = (() => {
  // HUD layout constants
  const PADDING = 16;
  const ICON_SIZE = 18;
  const ICON_GAP = 6;
  const FONT_SIZE = 18;
  const FONT_FAMILY = 'monospace';
  const COLOR_TEXT = '#00ff88';
  const COLOR_LABEL = '#aaffcc';
  const COLOR_LIVES = '#00ccff';
  const COLOR_BOMBS = '#ff8800';
  const COLOR_SHADOW = 'rgba(0,0,0,0.55)';

  /**
   * Draw a small ship icon representing a life.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - centre x
   * @param {number} y - centre y
   * @param {number} size - icon bounding size
   */
  function drawLifeIcon(ctx, x, y, size) {
    const s = size * 0.5;
    ctx.save();
    ctx.strokeStyle = COLOR_LIVES;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Simple ship silhouette: triangle pointing right
    ctx.moveTo(x + s, y);
    ctx.lineTo(x - s, y - s * 0.6);
    ctx.lineTo(x - s * 0.4, y);
    ctx.lineTo(x - s, y + s * 0.6);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw a bomb icon.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - centre x
   * @param {number} y - centre y
   * @param {number} size - icon bounding size
   */
  function drawBombIcon(ctx, x, y, size) {
    const r = size * 0.38;
    ctx.save();
    ctx.strokeStyle = COLOR_BOMBS;
    ctx.fillStyle = COLOR_BOMBS;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y + r * 0.2, r, 0, Math.PI * 2);
    ctx.fill();
    // fuse
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.8);
    ctx.lineTo(x + r * 0.6, y - r * 1.4);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw text with a subtle drop-shadow for readability.
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {string} color
   */
  function drawShadowText(ctx, text, x, y, color) {
    ctx.save();
    ctx.font = `bold ${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = COLOR_SHADOW;
    ctx.fillText(text, x + 1, y + 1);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /**
   * Render the full HUD onto the given canvas context.
   *
   * @param {CanvasRenderingContext2D} ctx  - 2D rendering context
   * @param {number} canvasWidth            - canvas pixel width
   * @param {object} state                  - game state object
   * @param {number} state.score            - current score
   * @param {number} state.highScore        - all-time high score
   * @param {number} state.lives            - remaining lives (0–5)
   * @param {number} state.bombs            - remaining smart bombs (0–3)
   * @param {number} [state.level]          - optional wave/level number
   */
  function render(ctx, canvasWidth, state) {
    const { score = 0, highScore = 0, lives = 0, bombs = 0, level } = state;

    // ── Score (top-left) ────────────────────────────────────────────────
    drawShadowText(ctx, String(score).padStart(6, '0'), PADDING, PADDING, COLOR_TEXT);

    // ── High score (top-centre) ─────────────────────────────────────────
    const hiLabel = 'HI ' + String(highScore).padStart(6, '0');
    ctx.save();
    ctx.font = `bold ${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textBaseline = 'top';
    const hiWidth = ctx.measureText(hiLabel).width;
    ctx.restore();
    drawShadowText(ctx, hiLabel, Math.floor((canvasWidth - hiWidth) / 2), PADDING, COLOR_LABEL);

    // ── Level (top-right, optional) ─────────────────────────────────────
    if (level !== undefined) {
      const lvlLabel = 'LVL ' + level;
      ctx.save();
      ctx.font = `bold ${FONT_SIZE}px ${FONT_FAMILY}`;
      ctx.textBaseline = 'top';
      const lvlWidth = ctx.measureText(lvlLabel).width;
      ctx.restore();
      drawShadowText(ctx, lvlLabel, canvasWidth - PADDING - lvlWidth, PADDING, COLOR_LABEL);
    }

    // ── Lives (row of ship icons, top-left below score) ─────────────────
    const livesY = PADDING + FONT_SIZE + 8;
    const maxLives = 5;
    const displayLives = Math.min(Math.max(lives, 0), maxLives);
    for (let i = 0; i < displayLives; i++) {
      drawLifeIcon(ctx, PADDING + ICON_SIZE / 2 + i * (ICON_SIZE + ICON_GAP), livesY + ICON_SIZE / 2, ICON_SIZE);
    }

    // ── Smart bombs (row of bomb icons, top-right below score) ──────────
    const maxBombs = 3;
    const displayBombs = Math.min(Math.max(bombs, 0), maxBombs);
    const bombsRowRight = canvasWidth - PADDING;
    for (let i = 0; i < displayBombs; i++) {
      const bx = bombsRowRight - (i + 1) * (ICON_SIZE + ICON_GAP) + ICON_SIZE / 2;
      drawBombIcon(ctx, bx, livesY + ICON_SIZE / 2, ICON_SIZE);
    }
  }

  /**
   * Submit the player's score to the server.
   * POST /score  { name, score }
   * @param {string} playerName
   * @param {number} score
   * @returns {Promise<object>}  resolved server response JSON
   */
  async function submitScore(playerName, score) {
    const res = await fetch('/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerName, score }),
    });
    if (!res.ok) {
      throw new Error('submitScore: server returned ' + res.status);
    }
    return res.json();
  }

  /**
   * Fetch the leaderboard / high scores from the server.
   * GET /score
   * @returns {Promise<Array<{name:string,score:number}>>}
   */
  async function fetchScores() {
    const res = await fetch('/score');
    if (!res.ok) {
      throw new Error('fetchScores: server returned ' + res.status);
    }
    return res.json();
  }

  // Public API
  return { render, submitScore, fetchScores };
})();

// Allow CommonJS / module usage in test environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HUD;
}