/**
 * Начинаем игру если достаточно игроков
 */

var constants = require('../../../constants');
 
module.exports = function() {
  if(this.checkCountPlayers()) {
    this._handlers[constants.G_START]();
  }
};