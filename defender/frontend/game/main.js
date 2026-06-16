// Entry point that wires the renderer and HUD together
(function () {
    const renderer = new Renderer('game-canvas');
    const hud = new HUD('hud');

    function loop() {
        renderer.step();   // update and draw the scene
        hud.tick();        // update HUD
        requestAnimationFrame(loop);
    }

    // Start the animation loop
    requestAnimationFrame(loop);
})();