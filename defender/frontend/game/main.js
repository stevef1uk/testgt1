/* Helper wrappers for legacy utility functions – map to native DOM APIs */
function ElementById(id) { return document.getElementById(id); }
function Canvas(id) { return document.getElementById(id); }  /* alias – not used */
function Context(canvas) { return canvas.getContext('2d'); }
function INTRO() {}  /* no‑op placeholder */
function AnimationFrame(cb) { requestAnimationFrame(cb); }
/* Removed duplicate unused import – native DOM APIs are used */

/**
 * Main entry point for the frontend game.
 *
 * This module glues together the various game components (renderer, HUD, input,
 * player, etc.) and runs the main animation loop via `requestAnimationFrame`.
 *
 * It implements a simple finite‑state machine with the following states:
 *
 *   - TITLE   : Show the game title screen.
 *   - INTRO   : Play an introductory animation before gameplay.
 *   - PLAY    : Main gameplay loop.
 *   - DEATH   : Player lost a life, show a short death animation.
 *   - GAMEOVER: All lives lost, show the game‑over screen.
 *
 * The implementation uses only standard browser APIs; any helper utilities that
 * were previously referenced (e.g., `ElementById`, `Canvas`, `Context`,
 * `INTRO`, `AnimationFrame`) have been replaced with native equivalents.
 *
 * The module expects the following files to exist under `defender/frontend/game/`:
 *
 *   - input.js   – Exports `initInput(state)` to set up keyboard handling.
 *   - renderer.js – Exports `render(state, ctx)` to draw the game world.
 *   - hud.js      – Exports `draw(state, ctx)` to render the HUD.
 *   - player.js   – Exports `reset(state)` and other player helpers.
 *
 * If any of these modules are missing, the code will still run (no‑op
 * fall‑backs are used) so that the frontend can be visually inspected.
 */
// Game entry point for the frontend.
// Sets up the canvas, wires together renderer and HUD modules,
// runs the main game loop via requestAnimationFrame,
// and implements a simple finite‑state machine (title, intro, gameplay, death, game‑over).

(function () {
  // Retrieve the canvas element (must exist in index.html) and its 2D context.
  const canvas = ElementById("gameCanvas");
  if (!canvas) {
    console.error("Game canvas element with id 'gameCanvas' not found.");
    return;
  }
  const ctx = Context(canvas);

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
    renderFrame: function () {
      // No‑op placeholder.
    },
  };

  const hud = window.HUD || {
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
        document.addEventListener(
          "keydown",
          () => {
            currentState = STATES.INTRO;
          },
          { once: true }
        );
        break;
      case STATES.INTRO:
        setTimeout(() => {
          currentState = STATES.PLAY;
        }, 1000);
        break;
      case STATES.PLAY:
        // Gameplay logic would go here.
        break;
      case STATES.DEATH:
        state.lives--;
        currentState = state.lives > 0 ? STATES.INTRO : STATES.GAMEOVER;
        break;
      case STATES.GAMEOVER:
        // End of game.
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Main render loop – called via requestAnimationFrame.
  // ---------------------------------------------------------------------------
  function loop() {
    transition();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderer.renderFrame(ctx, state);
    hud.render(ctx, state);
    if (currentState !== STATES.GAMEOVER) {
      AnimationFrame(loop);
    }
  }

  // ---------------------------------------------------------------------------
  // Public start function – can be called after all assets are ready.
  // ---------------------------------------------------------------------------
  function start() {
    currentState = STATES.TITLE;
    AnimationFrame(loop);
  }

  // Expose a global API so other scripts (or manual testing) can start the game.
  window.GameMain = {
    start: start,
    getState: () => ({ ...state, currentState }),
  };
})();
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
console.log('main.js loaded');
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
// Game entry point for the frontend.
// Sets up the canvas, wires together renderer and HUD modules,
// runs the main game loop via requestAnimationFrame,
// and implements a simple finite‑state machine (title, intro, gameplay, death, game‑over).

(function () {
  // Retrieve the canvas element (must exist in index.html) and its 2D context.
  const canvas = ElementById("gameCanvas");
  if (!canvas) {
    console.error("Game canvas element with id 'gameCanvas' not found.");
    return;
  }
  const ctx = Context(canvas);

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