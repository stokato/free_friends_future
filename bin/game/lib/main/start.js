/**
 * Начинаем игру если достаточно игроков
 */

const finishPause = require('../handlers/finishers/f_pause');
 
module.exports = function() {
  if(this.checkCountPlayers()) {
    this._isActive = true;
    
    finishPause(false, this);
  }
};