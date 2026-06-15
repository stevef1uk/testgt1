// hud.js - User interface elements for displaying game information

/**
 * HUD class manages the Heads-Up Display elements.
 * @param {number} canvasWidth - Width of the game canvas.
 * @param {number} canvasHeight - Height of the game canvas.
 */
class HUD {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.score = 0;
        this.lives = 3;
        this.fontSize = 16;
        this.fontFamily = 'Arial';
    }

    // Update game state values (score, lives, etc.)
    update(score, lives) {
        this.score = score;
        this.lives = lives;
    }

    // Draw the HUD onto a CanvasRenderingContext2D
    draw(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;

        // Draw score
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 30);

        // Draw lives
        ctx.textAlign = 'right';
        ctx.fillText(`Lives: ${this.lives}`, this.canvasWidth - 10, 30);
    }

    // Method to display a game over message
    drawGameOver(ctx) {
        ctx.fillStyle = '#f00';
        ctx.font = `48px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.canvasWidth / 2, this.canvasHeight / 2);
    }

    // Method to display a victory message
    drawVictory(ctx) {
        ctx.fillStyle = '#0f0';
        ctx.font = `48px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', this.canvasWidth / 2, this.canvasHeight / 2);
    }
}

// Export HUD for use in other game modules
if (typeof window !== "undefined") {
    window.game = window.game || {};
    window.game.HUD = HUD;
}