var constants = require('../constants');

// Останавливаем игру и сбросить флаги готовности к игре у всех игроков
module.exports = function() {
  clearTimeout(this.gTimer);

  this.gNextGame = constants.G_START;

  this.gActionsQueue = {};
  this.gActionsLimits = {};
  this.gStoredOptions  = {};
  this.gActivePlayers  = {};

  this.gameState = null;

  this.gTimer = null;
  this.gActionsCount = 0;

  this.gPrisoner = null;

  this.start();
};