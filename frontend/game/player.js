export class Player {
    constructor(canvasWidth) {
        this.x = canvasWidth / 2;
        this.y = 300;
        this.w = 25;
        this.h = 12;
        this.vx = 0;
        this.vy = 0;
    }

    update(input, cw, ch) {
        this.vx = input.left ? -5 : input.right ? 5 : 0;
        this.vy = input.up ? -4 : input.down ? 4 : 0;
        this.x += this.vx;
        this.y += this.vy;
        this.x = Math.max(20, Math.min(cw - 40, this.x));
        this.y = Math.max(20, Math.min(ch - 40, this.y));
    }
}
