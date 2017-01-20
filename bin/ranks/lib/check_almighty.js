/**
 * Created by Durov on 01.01.2017.
 *
 * Проверяем, достиг ли пользоатель звания Всемогущий
 */

const Config = require('./../../../config.json');

module.exports = function (uid) {
  
  const RANKS = Config.ranks;
  const ALMIGHTY = Config.almighty;

  let isAllRanks = true;

  for(let item in RANKS) if(RANKS.hasOwnProperty(item)) {
    if( this._rRankOwners[RANKS[item].name] != uid) {
      isAllRanks = false;
    }
  }

  if(isAllRanks) {
    this._rRankOwners[ALMIGHTY] = uid;
  }
};