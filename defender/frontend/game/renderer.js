// defender/frontend/game/renderer.js

// Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BACKGROUND_COLOR = 'black';

// Setup canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Clear canvas and draw background
function drawBackground() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Render game objects
function render(gameState) {
  drawBackground();

  // Render player ship
  const ship = gameState.player.ship;
  ctx.fillStyle = 'white';
  ctx.fillRect(ship.x, ship.y, ship.width, ship.height);

  // Render enemies
  ctx.fillStyle = 'red';
  gameState.enemies.forEach(enemy => {
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  // Render bullets
  ctx.fillStyle = 'blue';
  gameState.bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Export render function
export { render };