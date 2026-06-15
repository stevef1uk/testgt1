// Humanoids module – defines enemy and ally character behavior for the game.
// This script is loaded as a plain <script> tag alongside other game scripts.

(() => {
    // Simple humanoid constructor
    function Humanoid(options) {
        this.type = options.type || 'enemy'; // 'enemy' or 'ally'
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.health = options.health !== undefined ? options.health : 100;
        this.speed = options.speed || 1;
        this.sprite = options.sprite || null; // could be an Image or canvas draw fn
    }

    // Movement logic – basic linear motion towards a target point
    Humanoid.prototype.moveTowards = function (targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return;
        const nx = (dx / dist) * this.speed;
        const ny = (dy / dist) * this.speed;
        this.x += nx;
        this.y += ny;
    };

    // Damage handling
    Humanoid.prototype.takeDamage = function (amt) {
        this.health = Math.max(0, this.health - amt);
        if (this.health === 0) {
            this.die();
        }
    };

    Humanoid.prototype.die = function () {
        // Placeholder: in a full game this would trigger an explosion,
        // remove the entity from the world, etc.
        this.alive = false;
        if (this.sprite && this.sprite.remove) {
            this.sprite.remove();
        }
    };

    // Rendering stub – actual drawing is delegated to the renderer module
    Humanoid.prototype.render = function (ctx) {
        if (!ctx) return;
        if (this.sprite && typeof this.sprite.draw === 'function') {
            this.sprite.draw(ctx, this.x, this.y);
        } else {
            // Simple placeholder: draw a colored rectangle
            ctx.fillStyle = this.type === 'enemy' ? '#ff5555' : '#55ff55';
            ctx.fillRect(this.x - 5, this.y - 5, 10, 10);
        }
    };

    // Export a simple factory for creating humanoids
    const Humanoids = {
        create: function (spec) {
            return new Humanoid(spec);
        },
        // Utility to create a batch from an array of specs
        batchCreate: function (specs) {
            return specs.map(s => new Humanoid(s));
        }
    };

    // Expose globally so other modules (e.g., game controller) can use it
    window.Humanoids = Humanoids;
})();