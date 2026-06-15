// Main game controller – sets up canvas, initializes modules, and runs the game loop.
// Loaded as a plain <script> tag alongside other game scripts.

// Import necessary modules (assuming they are loaded globally or via other mechanisms)
// In a real module system, these would be proper imports.
const { Renderer } = window.Renderer || {}; // Assuming Renderer is exposed globally
const { Input } = window.Input || {};
const { HUD } = window.HUD || {};
const { Humanoids } = window.Humanoids || {}; // Assuming Humanoids are available
const { Bullets } = window.Bullets || {}; // Assuming Bullets are available

(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    if (!canvas) {
        console.error('Game init failed: #gameCanvas not found');
        return;
    }

    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 600;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const renderer = new Renderer(); // Instantiate the renderer
    const gameEntities = []; // Use a local array for entities managed by main.js

    const initModules = () => {
        if (Input) Input.init();
        if (HUD) HUD.init();
        if (Humanoids) Humanoids.init(); // Assuming Humanoids has an init method
        if (Bullets) Bullets.init(); // Assuming Bullets has an init method
    };

    const createPlayer = () => {
        if (Humanoids) {
            const player = Humanoids.create({ type: 'player', x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, speed: 5 });
            if (player) {
                gameEntities.push(player);
            }
        }
    };

    // Example: create initial enemies
    const createInitialEnemies = () => {
        if (Humanoids) {
            const enemies = Humanoids.batchCreate([
                { type: 'enemy', x: 100, y: 50, speed: 2 },
                { type: 'enemy', x: 700, y: 50, speed: 2 },
                { type: 'enemy', x: 300, y: 100, speed: 1.5 },
                { type: 'enemy', x: 500, y: 100, speed: 1.5 }
            ]);
            if (enemies) {
                gameEntities.push(...enemies);
            }
        }
    };

    // Game loop
    function gameLoop() {
        // Handle Input
        if (Input) {
            const actions = Input.getActions();
            // Apply player actions
            const player = gameEntities.find(e => e.type === 'player');
            if (player && typeof player.handleInput === 'function') {
                player.handleInput(actions);
            }
            // Potentially spawn bullets on fire action
            if (actions.fire && Bullets && player) {
                const newBullets = Bullets.spawn(player.x, player.y - 20); // Adjust spawn point
                if (newBullets) {
                    gameEntities.push(...newBullets);
                }
            }
        }

        // Update Game State
        gameEntities.forEach(entity => {
            // Update bullets
            if (entity.type === 'bullet') {
                if (typeof entity.update === 'function') {
                    entity.update();
                }
                // Remove bullets that go off-screen
                if (entity.x < 0 || entity.x > GAME_WIDTH || entity.y < 0 || entity.y > GAME_HEIGHT) {
                    entity.isDead = true; // Mark for removal
                }
            }
            // Update humanoids (enemies, player)
            else if (entity.type === 'player' || entity.type === 'enemy') {
                if (typeof entity.update === 'function') {
                    entity.update();
                }
            }
        });

        // Remove dead entities
        const livingEntities = gameEntities.filter(entity => !entity.isDead);
        gameEntities.length = 0; // Clear current array
        gameEntities.push(...livingEntities); // Refill with living entities


        // Render Game
        renderer.render(gameEntities); // Use the instantiated renderer

        // Render HUD
        if (HUD) {
            const minimapData = gameEntities.map(e => ({
                x: e.x,
                y: e.y,
                type: e.type
            }));
            HUD.setMinimap(minimapData);
            HUD.render();
        }

        // Schedule next frame
        requestAnimationFrame(gameLoop);
    }

    // Start the game
    initModules();
    createPlayer();
    createInitialEnemies();
    requestAnimationFrame(gameLoop);

    // Expose a simple API for external control (e.g., testing)
    window.Game = {
        getEntities: () => gameEntities.map(e => ({
            type: e.type,
            x: e.x,
            y: e.y,
            health: e.health,
            speed: e.speed,
            isDead: e.isDead
        })),
        addEntity: ent => {
            if (ent && typeof ent.render === 'function' && !ent.isDead) {
                gameEntities.push(ent);
            }
        },
        removeEntity: entityToRemove => {
            const index = gameEntities.indexOf(entityToRemove);
            if (index > -1) {
                gameEntities.splice(index, 1);
            }
        }
    };
})();