// Renderer utilities for the Defender game.
// Implements Sprite, Particle, Path, Image, and particle rendering functions.

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

function Image(src) {
  const img = new window.Image();
  img.src = src;
  return img;
}

// Renders an array of Particle objects onto the canvas context.
function AndRenderParticles(particles, ctx) {
  particles.forEach(p => {
    if (p.ttl > 0) {
      ctx.fillRect(p.x, p.y, 2, 2);
      p.update();
    }
  });
}