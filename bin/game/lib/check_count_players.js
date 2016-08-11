var constants = require('../../constants');

// Проверяем, достаточно ли игроков для продолжения игры
module.exports = function() {

  var guysInPrison  = 0;
  var girlsInPrison = 0;

  if(this.gPrisoner !== null) {
    var sex = this.gPrisoner.sex;

    if(sex == constants.GUY) {
      guysInPrison = 1;
    } else {
      girlsInPrison = 1;
    }
  }

  var guysCount = this.gRoom.guys_count - guysInPrison;
  var girlsCount = this.gRoom.girls_count - girlsInPrison;

  if((guysCount) < constants.PLAYERS_COUNT || (girlsCount) < constants.PLAYERS_COUNT) {
    return false;
  }

  return true;
};