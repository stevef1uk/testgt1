// World class for the game frontend.
// Manages the main game entities: player, enemies, bullets, and rendering.
class World {
    constructor() {
        // Player instance
        this.player = null;
        // Arrays to hold game entities
        this.enemies = [];
        this.bullets = [];
        // Renderer (optional, can be set later)
        this.renderer = null;
        // Game state flags
        this.running = false;
    }

    // Initialize the world with a player and optional renderer.
    init(player, renderer = null) {
        this.player = player;
        this.renderer = renderer;
        this.enemies = [];
        this.bullets = [];
        this.running = true;
    }

    // Add an enemy to the world.
    addEnemy(enemy) {
        if (enemy) {
            this.enemies.push(enemy);
        }
    }

    // Add a bullet (e.g., fired by player or enemy).
    addBullet(bullet) {
        if (bullet) {
            this.bullets.push(bullet);
        }
    }

    // Update all entities. `dt` is the time delta in seconds.
    update(dt) {
        if (!this.running) return;
        // Update player
        if (this.player && typeof this.player.update === 'function') {
            this.player.update(dt);
        }
        // Update enemies
        for (const e of this.enemies) {
            if (e && typeof e.update === 'function') {
                e.update(dt);
            }
        }
        // Update bullets
        for (const b of this.bullets) {
            if (b && typeof b.update === 'function') {
                b.update(dt);
            }
        }
        // Simple cleanup: remove dead bullets/enemies if they have `alive` flag.
        this.bullets = this.bullets.filter(b => b.alive !== false);
        this.enemies = this.enemies.filter(e => e.alive !== false);
    }

    // Render the world using the attached renderer.
    render() {
        if (!this.renderer) return;
        const entities = [];
        if (this.player) entities.push(this.player);
        entities.push(...this.enemies);
        entities.push(...this.bullets);
        this.renderer.render(entities);
    }

    // Stop the game loop.
    stop() {
        this.running = false;
    }
}

// Export for Node.js environments; browsers will ignore this block.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = World;
}