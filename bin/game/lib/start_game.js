/**
 * Начинаем игру если достаточно игроков
 */

const constants = require('./../../constants');
 
module.exports = function() {
  if(this.checkCountPlayers()) {
    this._isActive = true;
    
    this._handlers[constants.G_START][constants.GT_FIN](this);
  }
};