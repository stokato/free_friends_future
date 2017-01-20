/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем профиль к списку
 */

const Config = require('./../../../config.json');

module.exports = function (profile) {
  
  const RANKS = Config.ranks;
  
  let uid = profile.getID();
  
  this._rProfiles[uid] = {};
  for(let item in RANKS) if(RANKS.hasOwnProperty(item)) {
    this._rProfiles[uid][RANKS[item].name] = 0;
  }
  
};