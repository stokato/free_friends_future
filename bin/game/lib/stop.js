var constants = require('../constants');

// Останавливаем игру и сбросить флаги готовности к игре у всех игроков
module.exports = function() {
  clearTimeout(this.gTimer);
  
  var guys = this.gRoom.guys;
  var girls = this.gRoom.girls;
  var item;

  for (item in guys) if(guys.hasOwnProperty(item)) {
    guys[item].setInPrison(false);
  }
  for (item in girls) if(girls.hasOwnProperty(item)) {
    girls[item].setInPrison(false);
  }

  this.gNextGame = constants.G_START;

  this.gActionsQueue = {};
  this.gActionsLimits = {};
  this.gStoredOptions  = {};
  this.gActivePlayers  = {};

  this.gameState = null;

  this.gTimer = null;
  this.gActionsCount = 0;
};