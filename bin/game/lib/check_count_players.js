const Config        = require('./../../../config.json');

const MIN_PLAYERS = Number(Config.game.players_min);
const GUY = Config.user.constants.sex.male;
const GIRL = Config.user.constants.sex.female;

// Проверяем, достаточно ли игроков для продолжения игры
module.exports = function() {

  let guysInPrison  = 0;
  let girlsInPrison = 0;

  if(this._prisoner !== null) {
    let sex = this._prisoner.sex;

    if(sex == GUY) {
      guysInPrison = 1;
    } else {
      girlsInPrison = 1;
    }
  }

  let guysCount = this._room.getCountInRoom(GUY) - guysInPrison;
  let girlsCount = this._room.getCountInRoom(GIRL)- girlsInPrison;

  if((guysCount) < MIN_PLAYERS || (girlsCount) < MIN_PLAYERS) {
    return false;
  }

  return true;
};