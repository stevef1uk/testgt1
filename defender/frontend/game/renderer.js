// Simple renderer for the game frontend.
// It assumes an HTML canvas with id "gameCanvas" exists in index.html.
class Renderer {
    constructor() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element with id "gameCanvas" not found');
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // Set canvas dimensions (can be overridden by CSS)
        this.canvas.width = this.canvas.width || 800;
        this.canvas.height = this.canvas.height || 600;
    }

    // Clear the canvas for a new frame.
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw a generic entity (expects an object with x, y, and draw method).
    drawEntity(entity) {
        if (entity && typeof entity.draw === 'function') {
            entity.draw(this.ctx);
        }
    }

    // Render a collection of entities.
    render(entities = []) {
        this.clear();
        for (const e of entities) {
            this.drawEntity(e);
        }
    }
}

// Export for Node.js environments; browsers will ignore this block.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}