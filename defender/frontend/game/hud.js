// HUD helper functions for the Defender game.

function API(endpoint, options) {
  return fetch(endpoint, options).then(res => res.json());
}

// Draw a label (text) at a given position on a canvas context.
function Label(text, x, y, ctx) {
  ctx.fillStyle = 'white';
  ctx.fillText(text, x, y);
}

// Alias for Label; used in some parts of the architecture.
function Text(text, x, y, ctx) {
  ctx.fillStyle = 'white';
  ctx.fillText(text, x, y);
}