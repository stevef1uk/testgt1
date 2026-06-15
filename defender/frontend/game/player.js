// Player class for the game frontend
/* Player implementation */
class Player {
    constructor(x = 0, y = 0) {
        // Position
        this.x = x;
        this.y = y;
        // Velocity
        this.vx = 0;
        this.vy = 0;
        // Lives and bombs
        this.lives = 3;
        this.bombs = 2;
        // Fire cooldown timer (seconds)
        this.fireCooldown = 0;
    }

    // Update position based on velocity and time delta
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt;
        }
    }

    // Set the player's velocity
    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }

    // Attempt to fire a bullet; returns true if a shot is fired
    fire() {
        if (this.fireCooldown <= 0) {
            this.fireCooldown = 0.2; // seconds between shots
            return true;
        }
        return false;
    }

    // Use a smart bomb; returns true if a bomb was available
    bomb() {
        if (this.bombs > 0) {
            this.bombs--;
            return true;
        }
        return false;
    }

    // Called when the player takes damage
    hit() {
        if (this.lives > 0) {
            this.lives--;
        }
    }

    // Reset player state (e.g., after losing a life)
    reset(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.fireCooldown = 0;
    }
}

// Export for Node.js environments; browsers will ignore this block
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}