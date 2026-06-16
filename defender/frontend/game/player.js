class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 200; // pixels per second

        // Gameplay state
        this.lives = 3;          // player lives
        this.bombs = 1;          // smart bombs available
        this.fireCooldown = 0;   // time until next shot can be fired
        this.fireRate = 0.25;    // seconds between shots
    }

    // Update player position based on input (direction vector) and handle bounds
    update(dt, input) {
        const dir = input.getDirection();
        this.x += dir.dx * this.speed * dt;
        this.y += dir.dy * this.speed * dt;

        // Keep player within canvas bounds if canvas is defined
        if (typeof canvas !== 'undefined') {
            const maxX = canvas.width - this.width;
            const maxY = canvas.height - this.height;
            this.x = Math.max(0, Math.min(this.x, maxX));
            this.y = Math.max(0, Math.min(this.y, maxY));
        }

        // Reduce fire cooldown timer
        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt;
        }
    }

    // Fire a bullet if cooldown allows
    fire(bulletPool) {
        if (this.fireCooldown <= 0) {
            // Spawn a bullet from the center top of the player ship
            bulletPool.spawn(this.x + this.width / 2, this.y, 0, -400);
            this.fireCooldown = this.fireRate;
        }
    }

    // Deploy a smart bomb to clear enemies
    bomb(enemies) {
        if (this.bombs > 0) {
            enemies.forEach(e => {
                if (typeof e.destroy === 'function') {
                    e.destroy();
                }
            });
            this.bombs--;
        }
    }

    // Take damage, decrease lives
    hit() {
        this.lives--;
        if (this.lives <= 0) {
            this.lives = 0;
            // Further death handling can be managed elsewhere
        }
    }
}

// Export Player to the global namespace for other scripts
window.Player = Player;