// main.js

function Frame(callback) {
  requestAnimationFrame(callback);
}

function EventListener(target, type, handler) {
  target.addEventListener(type, handler);
}

const STATES = {
  running: true,
  score: 0
};

function Timeout(callback, ms) {
  setTimeout(callback, ms);
}

function Rect(x, y, w, h) {
  return {x, y, w, h};
}

const Input = {
  keys: {},
  init: function() {
    EventListener(window, \"keydown\", e => { Input.keys[e.code] = true; });
    EventListener(window, \"keyup\", e => { Input.keys[e.code] = false; });
  }
};

function GAMEOVER() {
  STATES.running = false;
}

window.onload = function() {
  const canvas = document.getElementById(\"gameCanvas\");
  const ctx = canvas.getContext(\"2d\");
  Input.init();

  function gameLoop() {
    if (!STATES.running) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Example drawing
    const rect = Rect(50, 50, 100, 100);
    window.Renderer.drawRect(ctx, rect, \"red\");

    // HUD display
    window.Label(ctx, \"Score: \" + STATES.score, 10, 20);

    Frame(gameLoop);
  }

  gameLoop();
};
