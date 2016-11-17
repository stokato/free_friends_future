var constants = require('../../../constants');

// Проверяем, достаточно ли игроков для продолжения игры
module.exports = function() {

  var guysInPrison  = 0;
  var girlsInPrison = 0;

  if(this._prisoner !== null) {
    var sex = this._prisoner.sex;

    if(sex == constants.GUY) {
      guysInPrison = 1;
    } else {
      girlsInPrison = 1;
    }
  }

  var guysCount = this._room.getCountInRoom(constants.GUY) - guysInPrison;
  var girlsCount = this._room.getCountInRoom(constants.GIRL)- girlsInPrison;

  if((guysCount) < constants.PLAYERS_COUNT || (girlsCount) < constants.PLAYERS_COUNT) {
    return false;
  }

  return true;
};