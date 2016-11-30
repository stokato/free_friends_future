/**
 * Останавливаем игру
 */
var constants = require('../../../constants');

module.exports = function() {
  clearTimeout(this._timer);

  this._nextGame = constants.G_START;

  this._actionsQueue   = {};
  this._actionsLimits  = {};
  this._storedOptions  = {};
  this._activePlayers  = {};

  this._gameState = null;

  this._timer = null;
  this._actionsCount = 0;

  this._prisoner = null;

  this.start();
};