// Heads‑up display showing simple stats (e.g., frame count)
class HUD {
    constructor(elementId) {
        this.el = document.getElementById(elementId);
        if (!this.el) {
            throw new Error(`HUD element with id "${elementId}" not found`);
        }
        this.frame = 0;
    }

    tick() {
        this.frame++;
        this.el.textContent = `Frames: ${this.frame}`;
    }
}

// Export for usage in main.js
window.HUD = HUD;