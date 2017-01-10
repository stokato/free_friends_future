/**
 * Останавливаем игру
 */
const constants = require('../../../constants');

module.exports = function() {
  clearTimeout(this._timer);
  this._isActive = false;

  this._nextGame = constants.G_START;

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