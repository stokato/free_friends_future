/**
 * Проверяем, достаточно ли игроков для продолжения игры
 */

const Config        = require('./../../../config.json');

module.exports = function() {
  
  const MIN_PLAYERS = Number(Config.game.players_min);
  const GUY         = Config.user.constants.sex.male;
  const GIRL        = Config.user.constants.sex.female;

  let guysInPrisonCount  = 0;
  let girlsInPrisonCount = 0;

  if(this._prisoner !== null) {
    let sex = this._prisoner.sex;

    if(sex == GUY) {
      guysInPrisonCount = 1;
    } else {
      girlsInPrisonCount = 1;
    }
  }

  let guysCount = this._room.getCountInRoom(GUY) - guysInPrisonCount;
  let girlsCount = this._room.getCountInRoom(GIRL)- girlsInPrisonCount;

  if((guysCount) < MIN_PLAYERS || (girlsCount) < MIN_PLAYERS) {
    return false;
  }

  return true;
};