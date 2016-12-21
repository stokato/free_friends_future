var constants = require('../../../constants');
var Config        = require('./../../../../config.json');

var MIN_PLAYERS = Number(Config.game.players_min);

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

  if((guysCount) < MIN_PLAYERS || (girlsCount) < MIN_PLAYERS) {
    return false;
  }

  return true;
};