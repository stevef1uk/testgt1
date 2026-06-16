// Renderer module — plain vanilla JS (no ES module imports)
var Renderer = (function() {
  var canvas = document.getElementById('game-canvas');
  var ctx = canvas ? canvas.getContext('2d') : null;

  function clear() {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function drawBackground() {
    if (!ctx) return;
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (var i = 0; i < 80; i++) {
      var x = (i * 137.5) % canvas.width;
      var y = (i * 97.3) % canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  function drawPlayer(player) {
    if (!ctx || !player) return;
    ctx.save();
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(player.x + 15, player.y + 10);
    ctx.lineTo(player.x, player.y);
    ctx.lineTo(player.x, player.y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBullets(bullets) {
    if (!ctx || !bullets) return;
    ctx.fillStyle = '#ffff00';
    for (var i = 0; i < bullets.length; i++) {
      ctx.fillRect(bullets[i].x, bullets[i].y, 6, 2);
    }
  }

  function drawEnemies(enemies) {
    if (!ctx || !enemies) return;
    ctx.fillStyle = '#ff0000';
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      ctx.fillRect(e.x, e.y, 16, 12);
    }
  }

  function drawHumanoids(humanoids) {
    if (!ctx || !humanoids) return;
    ctx.fillStyle = '#00ffff';
    for (var i = 0; i < humanoids.length; i++) {
      var h = humanoids[i];
      ctx.fillRect(h.x, h.y, 8, 16);
    }
  }

  function renderFrame(state) {
    clear();
    drawBackground();
    if (state) {
      if (state.player) drawPlayer(state.player);
      if (state.bullets) drawBullets(state.bullets);
      if (state.enemies) drawEnemies(state.enemies);
      if (state.humanoids) drawHumanoids(state.humanoids);
    }
  }

  return {
    clear: clear,
    renderFrame: renderFrame,
    drawBackground: drawBackground,
    drawPlayer: drawPlayer,
    drawBullets: drawBullets,
    drawEnemies: drawEnemies,
    drawHumanoids: drawHumanoids
  };
})();