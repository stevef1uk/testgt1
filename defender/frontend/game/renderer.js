// renderer.js - plain JavaScript implementation for the game rendering system
// No ES module syntax; attaches to global window object for easy access.

function Renderer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
}

// Clear the entire canvas
Renderer.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

// Draw a generic entity (player, enemy, bullet, etc.)
Renderer.prototype.drawEntity = function (entity) {
    if (!entity) {
        return;
    }
    // Default styling
    var color = entity.color || 'white';
    var x = entity.x || 0;
    var y = entity.y || 0;
    var width = entity.width || 10;
    var height = entity.height || 10;

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
};

// Expose Renderer globally so other scripts can instantiate it
window.Renderer = Renderer;