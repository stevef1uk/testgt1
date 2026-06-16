 // defender/frontend/game/renderer.js
 // (Removed import; all utilities are defined within this file)
// Canvas drawing helpers used by the game frontend.
// Provides simple neon‑glow primitives, particle effects and sprite compositing.
// Exposes a global `Renderer` object with a `renderFrame(ctx, state)` method
// that the main loop can call each animation frame.

(function () {
  // ---------------------------------------------------------------------------
  // Configuration constants for visual effects.
  // ---------------------------------------------------------------------------
  const NEON_COLOR = "#00ff99";
  const NEON_GLOW = 12; // shadow blur radius
  const PARTICLE_COLOR = "rgba(255,255,255,0.8)";
  const PARTICLE_MAX_AGE = 30; // frames

  // ---------------------------------------------------------------------------
  // Utility: draw a rectangle with neon glow.
  // ---------------------------------------------------------------------------
  function neonRect(ctx, x, y, w, h) {
    ctx.save();
    ctx.shadowColor = NEON_COLOR;
    ctx.shadowBlur = NEON_GLOW;
    ctx.strokeStyle = NEON_COLOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Utility: draw a simple particle (circle) with fading alpha.
  // ---------------------------------------------------------------------------
  function drawParticle(ctx, p) {
    const alpha = Math.max(0, 1 - p.age / PARTICLE_MAX_AGE);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------------------------------------------------------------------------
  // Utility: draw an image (sprite) at a given position.
  // ---------------------------------------------------------------------------
  function drawSprite(ctx, img, x, y, w, h) {
    if (img && img.complete) {
      ctx.drawImage(img, x, y, w, h);
    }
  }

  // ---------------------------------------------------------------------------
  // Particle system – minimal implementation.
  // ---------------------------------------------------------------------------
  const particles = [];

  function spawnParticle(x, y) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 2 + Math.random() * 3,
      age: 0,
    });
  }

  function updateAndRenderParticles(ctx) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.age++;
      drawParticle(ctx, p);
      if (p.age > PARTICLE_MAX_AGE) {
        particles.splice(i, 1);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Public API – global Renderer object.
  // ---------------------------------------------------------------------------
  window.Renderer = {
    /**
     * Render a single frame of the game world.
     *
     * @param {CanvasRenderingContext2D} ctx - 2D canvas context.
     * @param {Object} state - Current game state (passed through from main.js).
     */
    renderFrame: function (ctx, state) {
      // Example background – neon‑bordered rectangle.
      neonRect(ctx, 20, 20, ctx.canvas.width - 40, ctx.canvas.height - 40);

      // Example particle effect (spawn a few particles around the center).
      const cx = ctx.canvas.width / 2;
      const cy = ctx.canvas.height / 2;
      for (let i = 0; i < 3; i++) {
        spawnParticle(cx, cy);
      }
      updateAndRenderParticles(ctx);

      // Example sprite placeholder – users can replace with actual images.
      // Here we draw a simple filled rectangle as a stub sprite.
      ctx.fillStyle = "#333";
      ctx.fillRect(cx - 15, cy - 15, 30, 30);
    },
  };
})();