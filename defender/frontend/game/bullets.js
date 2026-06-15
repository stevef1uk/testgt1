// Bullet class representing a projectile in the game.
class Bullet {
    constructor(x, y, vx, vy) {
        this.x = x;      // position x
        this.y = y;      // position y
        this.vx = vx;    // velocity x
        this.vy = vy;    // velocity y
        this.alive = true;
    }

    // Update position based on velocity and time delta.
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        // Simple bounds check; mark dead if off-screen (assuming 800x600 canvas)
        if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600) {
            this.alive = false;
        }
    }

    // Draw the bullet onto a canvas 2D context.
    draw(ctx) {
        if (!this.alive) return;
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
    }
}

// BulletPool manages a reusable pool of Bullet instances.
class BulletPool {
    constructor(maxSize = 50) {
        this.maxSize = maxSize;
        this.pool = [];
    }

    // Obtain a bullet from the pool or create a new one if the pool is not full.
    spawn(x, y, vx, vy) {
        let bullet;
        if (this.pool.length < this.maxSize) {
            bullet = new Bullet(x, y, vx, vy);
            this.pool.push(bullet);
        } else {
            // Reuse the oldest dead bullet
            bullet = this.pool.find(b => !b.alive);
            if (bullet) {
                bullet.x = x;
                bullet.y = y;
                bullet.vx = vx;
                bullet.vy = vy;
                bullet.alive = true;
            } else {
                // No reusable bullet; create a new one (will exceed maxSize temporarily)
                bullet = new Bullet(x, y, vx, vy);
                this.pool.push(bullet);
            }
        }
        return bullet;
    }

    // Update all bullets in the pool.
    update(dt) {
        for (const b of this.pool) {
            if (b.alive) {
                b.update(dt);
            }
        }
    }

    // Render all alive bullets.
    render(ctx) {
        for (const b of this.pool) {
            if (b.alive) {
                b.draw(ctx);
            }
        }
    }

    // Get an array of alive bullets (for collision checking, etc.).
    getAliveBullets() {
        return this.pool.filter(b => b.alive);
    }
}

// Export for Node.js environments; browsers will ignore this block.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Bullet, BulletPool };
}