/**
 * Начинаем игру если достаточно игроков
 */
 
module.exports = function() {
  if(this.checkCountPlayers()) {
    this._isActive = true;
    
    this._handlers[this.CONST.G_PAUSE][this.CONST.GT_FIN](this);
  }
};