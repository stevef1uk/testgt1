import { Player } from './player.js';
import { Input } from './input.js';

const canvas = document.getElementById('game');
canvas.width = 900;
canvas.height = 500;
const ctx = canvas.getContext('2d');

const player = new Player(canvas.width);
const input = new Input();

let score = 0;
let highScore = 0;
let lives = 3;
let bullets = [];
let enemies = [];
let humanoids = [];
let worldOffset = 0;
let gameOver = false;

fetch('/score').then(r => r.json()).then(d => { highScore = d.score; });

function spawnEnemy() {
    enemies.push({
        x: canvas.width + worldOffset,
        y: 50 + Math.random() * 400,
        w: 20, h: 15,
        vx: -2 - Math.random() * 2,
        vy: (Math.random() - 0.5) * 2
    });
}

function spawnHumanoid() {
    const gx = 300 + Math.random() * 300 + worldOffset;
    humanoids.push({ x: gx, y: 430, w: 8, h: 15, grabbed: false });
}

for (let i = 0; i < 3; i++) humanoids.push({ x: 400 + i * 80, y: 430, w: 8, h: 15, grabbed: false });

let frame = 0;
function loop() {
    if (gameOver) {
        ctx.fillStyle = '#f00';
        ctx.font = '40px monospace';
        ctx.fillText('GAME OVER', canvas.width / 2 - 120, canvas.height / 2);
        ctx.fillText('Press R to restart', canvas.width / 2 - 180, canvas.height / 2 + 50);
        requestAnimationFrame(loop);
        return;
    }
    frame++;
    if (frame % 120 === 0) spawnEnemy();
    if (frame % 300 === 0) spawnHumanoid();

    input.update();
    if (input.restart && gameOver) { location.reload(); return; }

    player.update(input, canvas.width, canvas.height);
    worldOffset += (input.left ? -3 : input.right ? 3 : 0);

    if (input.fire && frame % 8 === 0) {
        bullets.push({ x: player.x + worldOffset + 15, y: player.y + 5, vx: 8 });
    }

    bullets = bullets.filter(b => { b.x += b.vx; return b.x < worldOffset + canvas.width + 50; });

    enemies.forEach(e => {
        e.x += e.vx;
        e.y += e.vy;
        if (e.y < 10 || e.y > 480) e.vy *= -1;
        if (Math.random() < 0.01 && humanoids.find(h => !h.grabbed && Math.abs(h.x - e.x) < 30)) {
            const h = humanoids.find(h => !h.grabbed && Math.abs(h.x - e.x) < 30);
            if (h) h.grabbed = true;
        }
    });

    bullets.forEach(b => {
        enemies.forEach(e => {
            if (Math.abs(b.x - e.x) < 15 && Math.abs(b.y - e.y) < 15 && !e.dead) {
                e.dead = true;
                score += 25;
            }
        });
    });
    enemies = enemies.filter(e => !e.dead);

    enemies.forEach(e => {
        if (Math.abs(player.x + worldOffset - e.x) < 20 && Math.abs(player.y - e.y) < 20) {
            lives--;
            e.dead = true;
            if (lives <= 0) gameOver = true;
        }
    });
    enemies = enemies.filter(e => !e.dead);

    humanoids.forEach(h => {
        if (h.grabbed) {
            const carrier = enemies.find(e => Math.abs(e.x - h.x) < 30 && e.y > 100);
            if (carrier && carrier.y < 100 && Math.abs(player.x + worldOffset - carrier.x) < 30) {
                h.grabbed = false;
                score += 100;
            }
        }
    });

    if (score > highScore) {
        highScore = score;
        fetch('/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score, name: 'DEF' }) });
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ox = worldOffset % 50;
    ctx.strokeStyle = '#111';
    for (let x = -ox; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 20);
        ctx.lineTo(x + 30, canvas.height);
        ctx.stroke();
    }

    ctx.fillStyle = '#555';
    ctx.fillRect(0, canvas.height - 15, canvas.width, 15);

    ctx.fillStyle = '#0ff';
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = '#f00';
    bullets.forEach(b => ctx.fillRect(b.x - worldOffset, b.y, 6, 3));

    ctx.fillStyle = '#ff0';
    enemies.forEach(e => ctx.fillRect(e.x - worldOffset, e.y, e.w, e.h));

    ctx.fillStyle = '#0f0';
    humanoids.forEach(h => {
        if (!h.grabbed) ctx.fillRect(h.x - worldOffset, h.y, h.w, h.h);
    });

    document.getElementById('hud').textContent = `SCORE: ${score} | HIGH: ${highScore} | LIVES: ${lives}`;

    requestAnimationFrame(loop);
}

loop();
