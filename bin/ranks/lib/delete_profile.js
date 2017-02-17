/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Удаляем профиль
 */

const Config = require('./../../../config.json');

module.exports = function (profile) {
  
  const RANKS     = Config.ranks;
  const ALMIGHTY  = Config.almighty;
  
  let uid = profile.getID();
  
  profile.onSetActiveRank(null);
  
  delete this._rProfiles[uid];
  
  for(let item in RANKS) if(RANKS.hasOwnProperty(item)) {
    if(this._rRankOwners[RANKS[item].name] == uid) {
      this._rRankOwners[RANKS[item].name] = null;
      this._rBonuses[RANKS[item].name] = 0;
    }
  }

  if(this._rRankOwners[ALMIGHTY] == uid) {
    this._rRankOwners[ALMIGHTY] = null;
  }
  
  // Удаляем таймауты начисления бонусов
  if( this._rankTimers[uid] ) {
    for(let item in this._rankTimers[uid]) if (this._rankTimers[uid].hasOwnProperty(item)) {
      clearTimeout(this._rankTimers[uid][item]);
    }
  }
};