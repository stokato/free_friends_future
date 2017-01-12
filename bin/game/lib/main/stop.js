/**
 * Останавливаем игру
 */

module.exports = function() {
  clearTimeout(this._timer);
  this._isActive = false;

  this._nextGame = null;
  this._onGame = null;

  this._actionsQueue   = {};
  this._actionsLimits  = {};
  this._storedOptions  = {};
  this._activePlayers  = {};

  this._gameState = null;

  this._timer = null;
  this._actionsCount = 0;

  this._prisoner = null;
  
  if(this._onStart) {
    this._onStart();
  }

  this.start();
};