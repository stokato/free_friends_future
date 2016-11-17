var constants = require('../../constants');

// Начинаем игру если достаточно игроков
module.exports = function() {

  if(this.checkCountPlayers()) {
    this._handlers[constants.G_START]();
  }
};