/* Renderer utilities for the Defender game.
   Implements a simple particle system and a global Renderer object
   expected by the main game loop (window.Renderer).
*/

function Sprite(img, sx, sy, sw, sh) {
  this.img = img;
  this.sx = sx;
  this.sy = sy;
  this.sw = sw;
  this.sh = sh;
}
Sprite.prototype.draw = function (ctx, x, y) {
  ctx.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, x, y, this.sw, this.sh);
};

function Particle(x, y, vx, vy, ttl) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.ttl = ttl;
}
Particle.prototype.update = function () {
  this.x += this.vx;
  this.y += this.vy;
  this.ttl--;
};

function Path(points) {
  this.points = points; // array of {x, y}
}

/* Simple image loader */
function Image(src) {
  const img = new window.Image();
  img.src = src;
  return img;
}

/* Render an array of Particle objects onto the canvas context. */
function renderParticles(particles, ctx) {
  particles.forEach(p => {
    if (p.ttl > 0) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(p.x, p.y, 2, 2);
      p.update();
    }
  });
}

/* Global Renderer object – the main loop calls renderFrame(ctx, state). */
window.Renderer = {
  // Example: render a static background and particles.
  renderFrame: function (ctx, state) {
    // Clear background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw simple starfield particles if present in state.particles
    if (state.particles && Array.isArray(state.particles)) {
      renderParticles(state.particles, ctx);
    }

    // Future: draw sprites, paths, etc.
  },
};