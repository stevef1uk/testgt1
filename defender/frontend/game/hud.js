// HUD module — plain vanilla JS (no ES module imports)
var HUD = (function() {
  function updateScore(score) {
    var el = document.getElementById('score');
    if (el) el.textContent = 'Score: ' + score;
  }

  function updateLives(lives) {
    var el = document.getElementById('lives');
    if (el) el.textContent = 'Lives: ' + lives;
  }

  function updateBombs(bombs) {
    var el = document.getElementById('bombs');
    if (el) el.textContent = 'Bombs: ' + bombs;
  }

  function updateWave(wave) {
    var el = document.getElementById('wave');
    if (el) el.textContent = 'Wave: ' + wave;
  }

  function updateAll(state) {
    updateScore(state.score || 0);
    updateLives(state.lives || 0);
    updateBombs(state.bombs || 0);
    updateWave(state.wave || 1);
  }

  return {
    updateScore: updateScore,
    updateLives: updateLives,
    updateBombs: updateBombs,
    updateWave: updateWave,
    updateAll: updateAll
  };
})();