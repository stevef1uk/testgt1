// hud.js

function Label(ctx, text, x, y, color) {
  ctx.fillStyle = color || \"white\";
  ctx.font = \"16px sans-serif\";
  ctx.fillText(text, x, y);
}

function Text(ctx, text, x, y, color) {
  ctx.fillStyle = color || \"white\";
  ctx.font = \"12px sans-serif\";
  ctx.fillText(text, x, y);
}

window.Label = Label;

window.Text = Text;
