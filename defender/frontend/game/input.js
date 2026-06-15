// Input module – captures keyboard events and provides a simple state map
// for the player controller. Loaded as a plain <script> tag.

(() => {
    // Current key state
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Space: false,   // fire
        KeyB: false     // bomb
    };

    // Helper to translate KeyboardEvent.code to our key map
    function codeToKey(code) {
        if (code === 'ArrowUp') return 'ArrowUp';
        if (code === 'ArrowDown') return 'ArrowDown';
        if (code === 'ArrowLeft') return 'ArrowLeft';
        if (code === 'ArrowRight') return 'ArrowRight';
        if (code === 'Space') return 'Space';
        if (code === 'KeyB') return 'KeyB';
        return null;
    }

    function handleKey(e, isDown) {
        const key = codeToKey(e.code);
        if (!key) return;
        keys[key] = isDown;
        // Prevent scrolling with arrow keys / space
        e.preventDefault();
    }

    // Public API
    const Input = {
        init: function () {
            window.addEventListener('keydown', e => handleKey(e, true));
            window.addEventListener('keyup', e => handleKey(e, false));
        },
        // Returns a shallow copy of the current key state
        getState: function () {
            return { ...keys };
        },
        // Convenience booleans
        isUp: () => keys.ArrowUp,
        isDown: () => keys.ArrowDown,
        isLeft: () => keys.ArrowLeft,
        isRight: () => keys.ArrowRight,
        isFire: () => keys.Space,
        isBomb: () => keys.KeyB
    };

    // Expose globally for other modules (e.g., game controller)
    window.Input = Input;
})();