/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Удаляем профиль
 */

var constants = require('./../../constants');

module.exports = function (uid) {
  delete this._profiles[uid];
  
  for(var item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    if(this._rankOwners[constants.RANKS[item]] == uid) {
      this._rankOwners[constants.RANKS[item]] = null;
      this._bonuses[constants.RANKS[item]] = 0;
    }
  }
};