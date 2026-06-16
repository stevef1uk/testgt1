// defender/frontend/game/main.js
// Game entry point for the frontend.
// Sets up the canvas, wires together renderer and HUD modules,
// runs the main game loop via requestAnimationFrame,
// and implements a simple finite‑state machine (title, intro, gameplay, death, game‑over).

(function () {
  // Retrieve the canvas element (must exist in index.html) and its 2D context.
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) {
    console.error("Game canvas element with id 'gameCanvas' not found.");
    return;
  }
  const ctx = canvas.getContext("2d");

  // Ensure the canvas fills the browser window.
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // ---------------------------------------------------------------------------
  // Game state – mutable object passed to HUD and renderer each frame.
  // ---------------------------------------------------------------------------
  const state = {
    score: 0,
    lives: 3,
    bombs: 3,
    wave: 1,
    // Additional fields could be added (e.g., player position) but are not needed
    // for the HUD demo.
  };

  // ---------------------------------------------------------------------------
  // Finite‑state machine definitions.
  // ---------------------------------------------------------------------------
  const STATES = {
    TITLE: "title",
    INTRO: "intro",
    PLAY: "play",
    DEATH: "death",
    GAMEOVER: "gameover",
  };
  let currentState = STATES.TITLE;

  // ---------------------------------------------------------------------------
  // Module references (must be provided by other frontend files).
  // Expected to expose global objects `Renderer` and `HUD`.
  // Fallback to no‑op stubs to keep the script safe if modules are missing.
  // ---------------------------------------------------------------------------
  const renderer = window.Renderer || {
    // renderFrame(ctx, state) – draw the game world.
    renderFrame: function () {
      // No‑op placeholder.
    },
  };

  const hud = window.HUD || {
    // render(ctx, state) – draw the HUD overlay.
    render: function () {
      // No‑op placeholder.
    },
  };

  // ---------------------------------------------------------------------------
  // State transition logic – very simple for demonstration.
  // ---------------------------------------------------------------------------
  function transition() {
    switch (currentState) {
      case STATES.TITLE:
        // Wait for any key press to move to INTRO.
        document.addEventListener(
          "keydown",
          () => {
            currentState = STATES.INTRO;
          },
          { once: true }
        );
        break;

      case STATES.INTRO:
        // After a short delay, start gameplay.
        setTimeout(() => {
          currentState = STATES.PLAY;
        }, 1000);
        break;

      case STATES.PLAY:
        // Gameplay would update state here.
        // For the demo we simply keep the PLAY state.
        break;

      case STATES.DEATH:
        // Reduce a life, then either restart intro or end.
        state.lives--;
        currentState = state.lives > 0 ? STATES.INTRO : STATES.GAMEOVER;
        break;

      case STATES.GAMEOVER:
        // Nothing to do – wait for a page reload or external reset.
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Main render loop – called via requestAnimationFrame.
  // ---------------------------------------------------------------------------
  function loop() {
    // Update FSM before rendering.
    transition();

    // Clear the full canvas for a fresh frame.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render the game world.
    renderer.renderFrame(ctx, state);

    // Render the HUD overlay on top.
    hud.render(ctx, state);

    // Continue the loop unless we are in GAMEOVER.
    if (currentState !== STATES.GAMEOVER) {
      requestAnimationFrame(loop);
    }
  }

  // ---------------------------------------------------------------------------
  // Public start function – can be called after all assets are ready.
  // ---------------------------------------------------------------------------
  function start() {
    // Begin in TITLE state; the loop will handle transitions.
    currentState = STATES.TITLE;
    requestAnimationFrame(loop);
  }

  // Expose a global API so other scripts (or manual testing) can start the game.
  window.GameMain = {
    start: start,
    // Provide a shallow copy of the state for inspection/debugging.
    getState: () => ({ ...state, currentState }),
  };
})();