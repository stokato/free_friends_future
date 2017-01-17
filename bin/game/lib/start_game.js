/**
 * Начинаем игру если достаточно игроков
 */

const constants = require('./../../constants');
 
module.exports = function() {
  if(this.checkCountPlayers()) {
    this._isActive = true;
    
    this._handlers[this.CONST.G_START][this.CONST.GT_FIN](this);
  }
};