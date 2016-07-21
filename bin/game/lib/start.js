var constants = require('../constants'),
  randomPlayer = require('./random_player');


// Начинаем игру если есть нужное количество игроков и все они готовы
module.exports = function() {

  if(this.gRoom.guys_count >= constants.PLAYERS_COUNT &&
      this.gRoom.girls_count >= constants.PLAYERS_COUNT) {
    this.gHandlers[constants.G_START](null);
  }
};