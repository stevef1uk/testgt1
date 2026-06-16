// main.js — Defender game entry point (plain vanilla JS, no ES module imports)
// Depends on: renderer.js, hud.js (loaded before this script in index.html)

(function() {
  var STATE_TITLE    = 'title';
  var STATE_INTRO    = 'intro';
  var STATE_GAMEPLAY = 'gameplay';
  var STATE_DEATH    = 'death';
  var STATE_GAMEOVER = 'gameover';

  var gameState = {
    phase: STATE_TITLE,
    score: 0,
    lives: 3,
    bombs: 2,
    wave: 1,
    player: { x: 100, y: 150, vx: 0, vy: 0, facing: 1 },
    bullets: [],
    enemies: [],
    humanoids: [],
    frameCount: 0
  };

  var keys = {};
  document.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    if (gameState.phase === STATE_TITLE && e.key === ' ') {
      gameState.phase = STATE_INTRO;
      setTimeout(function() {
        if (gameState.phase === STATE_INTRO) {
          gameState.phase = STATE_GAMEPLAY;
          spawnEnemies();
        }
      }, 1500);
    }
    if (gameState.phase === STATE_GAMEPLAY && e.key === 'x' && gameState.bombs > 0) {
      gameState.bombs--;
      gameState.enemies = [];
    }
  });
  document.addEventListener('keyup', function(e) {
    keys[e.key] = false;
  });

  function spawnEnemies() {
    gameState.enemies = [];
    var count = 5 + gameState.wave * 2;
    for (var i = 0; i < count; i++) {
      gameState.enemies.push({
        x: 300 + Math.random() * 600,
        y: 50 + Math.random() * 250,
        vx: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random()),
        vy: (Math.random() < 0.5 ? -1 : 1) * 0.5,
        type: 'lander'
      });
    }
    gameState.humanoids = [];
    for (var j = 0; j < 10; j++) {
      gameState.humanoids.push({ x: 200 + j * 80, y: 310, alive: true });
    }
  }

  function updateGameplay() {
    var canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    var W = canvas.width;
    var H = canvas.height;
    var p = gameState.player;
    var speed = 4;

    if (keys['ArrowLeft'] || keys['a']) { p.vx = -speed; p.facing = -1; }
    else if (keys['ArrowRight'] || keys['d']) { p.vx = speed; p.facing = 1; }
    else { p.vx *= 0.85; }

    if (keys['ArrowUp'] || keys['w']) { p.vy = -speed; }
    else if (keys['ArrowDown'] || keys['s']) { p.vy = speed; }
    else { p.vy *= 0.85; }

    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = 0;
    if (p.x > W - 15) p.x = W - 15;
    if (p.y < 0) p.y = 0;
    if (p.y > H - 20) p.y = H - 20;

    if ((keys[' '] || keys['z']) && gameState.frameCount % 8 === 0) {
      gameState.bullets.push({ x: p.x + 15, y: p.y + 10, vx: p.facing * 10 });
    }

    var liveBullets = [];
    for (var i = 0; i < gameState.bullets.length; i++) {
      var b = gameState.bullets[i];
      b.x += b.vx;
      if (b.x >= 0 && b.x <= W) liveBullets.push(b);
    }
    gameState.bullets = liveBullets;

    for (var ei = 0; ei < gameState.enemies.length; ei++) {
      var e = gameState.enemies[ei];
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 0 || e.x > W) e.vx = -e.vx;
      if (e.y < 40 || e.y > H - 40) e.vy = -e.vy;
    }

    var survivingEnemies = [];
    for (var ei2 = 0; ei2 < gameState.enemies.length; ei2++) {
      var e2 = gameState.enemies[ei2];
      var hit = false;
      var survivingBullets = [];
      for (var bi = 0; bi < gameState.bullets.length; bi++) {
        var b2 = gameState.bullets[bi];
        if (!hit && b2.x >= e2.x && b2.x <= e2.x + 16 &&
            b2.y >= e2.y && b2.y <= e2.y + 12) {
          hit = true;
          gameState.score += 250;
        } else {
          survivingBullets.push(b2);
        }
      }
      if (hit) {
        gameState.bullets = survivingBullets;
      } else {
        survivingEnemies.push(e2);
      }
    }
    gameState.enemies = survivingEnemies;

    if (gameState.enemies.length === 0) {
      gameState.wave++;
      gameState.score += 1000;
      spawnEnemies();
    }

    for (var ci = 0; ci < gameState.enemies.length; ci++) {
      var ce = gameState.enemies[ci];
      if (p.x < ce.x + 16 && p.x + 15 > ce.x &&
          p.y < ce.y + 12 && p.y + 20 > ce.y) {
        gameState.lives--;
        gameState.phase = STATE_DEATH;
        setTimeout(function() {
          if (gameState.lives > 0) {
            gameState.player = { x: 100, y: 150, vx: 0, vy: 0, facing: 1 };
            gameState.bullets = [];
            gameState.phase = STATE_GAMEPLAY;
          } else {
            gameState.phase = STATE_GAMEOVER;
            postScore(gameState.score);
          }
        }, 1500);
        break;
      }
    }

    gameState.frameCount++;
  }

  function postScore(score) {
    fetch('/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: score })
    }).catch(function(err) {
      console.error('Failed to post score:', err);
    });
  }

  function drawOverlay(title, subtitle) {
    var canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 30);
    if (subtitle) {
      ctx.font = '20px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20);
    }
    ctx.textAlign = 'left';
  }

  function gameLoop() {
    if (gameState.phase === STATE_GAMEPLAY) {
      updateGameplay();
      Renderer.renderFrame(gameState);
      HUD.updateAll(gameState);
    } else if (gameState.phase === STATE_TITLE) {
      Renderer.renderFrame({ player: null, bullets: [], enemies: [], humanoids: [] });
      drawOverlay('DEFENDER', 'Press SPACE to start');
    } else if (gameState.phase === STATE_INTRO) {
      Renderer.renderFrame({ player: null, bullets: [], enemies: [], humanoids: [] });
      drawOverlay('WAVE ' + gameState.wave, 'Get ready!');
    } else if (gameState.phase === STATE_DEATH) {
      Renderer.renderFrame(gameState);
      drawOverlay('', gameState.lives > 0 ? 'SHIP DESTROYED' : '');
    } else if (gameState.phase === STATE_GAMEOVER) {
      Renderer.renderFrame({ player: null, bullets: [], enemies: [], humanoids: [] });
      drawOverlay('GAME OVER', 'Score: ' + gameState.score);
    }
    requestAnimationFrame(gameLoop);
  }

  window.addEventListener('load', function() {
    HUD.updateAll(gameState);
    requestAnimationFrame(gameLoop);
  });
})();
