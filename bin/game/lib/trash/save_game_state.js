var constants = require('../../../constants');

// Сохраняем текущее состояние игры
module.exports = function(options) {

  switch (this.gNextGame) {
    case constants.G_START:

      this.gameState = options;

      break;

    case constants.G_BOTTLE_KISSES:

      this.gameState = options;

      break;

    case constants.G_BEST:

      if(!this.gameState.picks) {
        this.gameState.picks = [];
      }

      this.gameState.picks.push(options.pick);

      break;
  }

};