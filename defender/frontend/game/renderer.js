// Simple renderer that draws a moving square on the canvas
class Renderer {
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.square = { x: 0, y: this.height / 2 - 25, size: 50, speed: 2 };
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawSquare() {
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(this.square.x, this.square.y, this.square.size, this.square.size);
    }

    update() {
        this.square.x += this.square.speed;
        if (this.square.x > this.width) {
            this.square.x = -this.square.size;
        }
    }

    render() {
        this.clear();
        this.drawSquare();
    }

    step() {
        this.update();
        this.render();
    }
}

// Export for usage in main.js
window.Renderer = Renderer;