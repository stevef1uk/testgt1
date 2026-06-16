/* HUD module for the Defender game.
   Provides a global HUD object with a `render(ctx, state)` method
   expected by the main loop (window.HUD). */

function API(endpoint, options) {
  return fetch(endpoint, options).then(res => res.json());
}

/* Render a simple label on the canvas. */
function drawLabel(text, x, y, ctx) {
  ctx.fillStyle = '#0f0';
  ctx.font = '14px monospace';
  ctx.fillText(text, x, y);
}

/* Global HUD object */
window.HUD = {
  // Render score, lives and wave information.
  render: function (ctx, state) {
    drawLabel('Score: ' + state.score, 10, 20, ctx);
    drawLabel('Lives: ' + state.lives, 10, 40, ctx);
    drawLabel('Wave: ' + state.wave, 10, 60, ctx);
  },
};