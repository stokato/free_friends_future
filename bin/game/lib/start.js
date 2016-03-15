var constants = require('../constants');

// Начинаем игру если есть нужное количество игроков и все они готовы
module.exports = function() {

  var item, guy, girl, allReady = true, countOfPlayers = 0;
  var guys = this.gRoom.guys;
  var girls = this.gRoom.girls;

  for (item in guys) if(guys.hasOwnProperty(item)) {
    guy = guys[item];
    if (!guy.getReady()) { allReady = false; }
    countOfPlayers ++;
  }
  for (item in girls) if(girls.hasOwnProperty(item)) {
    girl = girls[item];
    if (!girl.getReady()) { allReady = false; }
    countOfPlayers ++;
  }

  if(allReady && countOfPlayers == constants.PLAYERS_COUNT) {
    this.gHandlers.start(null);
  }
};