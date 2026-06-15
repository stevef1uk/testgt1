// enemies.js - manages enemy objects and pool

/**
 * Enemy represents a hostile ship or object.
 * @param {number} x - initial x position
 * @param {number} y - initial y position
 * @param {number} vx - velocity in x direction
 * @param {number} vy - velocity in y direction
 * @param {number} hp - hit points
 */
class Enemy {
  constructor(x, y, vx, vy, hp = 1) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 6; // visual radius
    this.hp = hp;
    this.active = true;
  }

  // Update position based on delta time (ms)
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  // Render the enemy on a CanvasRenderingContext2D
  draw(ctx) {
    ctx.fillStyle = "#f00";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Take damage; deactivate when hp reaches zero
  damage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.active = false;
    }
  }
}

/**
 * EnemyPool maintains a collection of active enemies.
 */
class EnemyPool {
  constructor() {
    this.enemies = [];
  }

  // Add a new enemy to the pool
  spawn(x, y, vx, vy, hp) {
    this.enemies.push(new Enemy(x, y, vx, vy, hp));
  }

  // Update all enemies; remove those that are inactive or off‑screen
  update(dt, width, height) {
    const alive = [];
    for (const e of this.enemies) {
      e.update(dt);
      if (
        e.x >= 0 &&
        e.x <= width &&
        e.y >= 0 &&
        e.y <= height &&
        e.active
      ) {
        alive.push(e);
      }
    }
    this.enemies = alive;
  }

  // Render all enemies
  draw(ctx) {
    for (const e of this.enemies) {
      e.draw(ctx);
    }
  }

  // Clear all enemies (e.g., on level reset)
  clear() {
    this.enemies = [];
  }
}

// Export symbols for other modules (attached to window.game)
if (typeof window !== "undefined") {
  window.game = window.game || {};
  window.game.Enemy = Enemy;
  window.game.EnemyPool = EnemyPool;
}