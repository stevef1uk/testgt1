// defender/frontend/game/hud.js
// Heads‑up display (HUD) for the game.
// Draws the current score, lives, bombs, and wave indicator on the game canvas.
//
// The HUD is a simple, framework‑free module that attaches a global `HUD`
// object to `window`.  The game loop (main.js) can call `HUD.render(ctx, state)`
// each frame.  `state` is expected to contain `score`, `lives`, `bombs` and
// `wave` numbers.
//
// No external dependencies are used; drawing is performed with the standard
// Canvas 2D API.

(function () {
  // Styling constants for the HUD.
  const FONT = "16px Arial";
  const COLOR = "#00ff00"; // neon‑green for visibility.
  const PADDING = 10;      // margin from the canvas edge.
  const SPACING_X = 120;   // horizontal distance between HUD items.

  /**
   * Helper that draws a label/value pair at the given coordinates.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
   * @param {string} label - Text label (e.g., "Score").
   * @param {number|string} value - Value to display.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   */
  function drawLabel(ctx, label, value, x, y) {
    ctx.fillStyle = COLOR;
    ctx.font = FONT;
    ctx.fillText(`${label}: ${value}`, x, y);
  }

  // Public API exposed as a global `HUD` object.
  window.HUD = {
    /**
     * Render the HUD on the supplied canvas context.
     *
     * @param {CanvasRenderingContext2D} ctx - The 2D drawing context of the game canvas.
     * @param {Object} state - Current game state.
     * @param {number} state.score - Player's score.
     * @param {number} state.lives - Remaining lives.
     * @param {number} state.bombs - Remaining bombs.
     * @param {number} state.wave - Current wave number.
     */
    render: function (ctx, state) {
      // Clear the top area where the HUD is drawn to avoid artifact buildup.
      // We only clear a thin horizontal band; the rest of the canvas is left untouched.
      ctx.clearRect(0, 0, ctx.canvas.width, 30);

      const y = PADDING + 12; // baseline for text vertical placement

      // Draw each HUD field with consistent spacing.
      drawLabel(ctx, "Score", state.score, PADDING, y);
      drawLabel(ctx, "Lives", state.lives, PADDING + SPACING_X, y);
      drawLabel(ctx, "Bombs", state.bombs, PADDING + SPACING_X * 2, y);
      drawLabel(ctx, "Wave", state.wave, PADDING + SPACING_X * 3, y);
    }
  };
})();