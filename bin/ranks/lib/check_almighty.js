/**
 * Created by Durov on 01.01.2017.
 *
 * Проверяем, достиг ли пользоатель звания Всемогущий
 */

const constants = require('./../../constants');

module.exports = function (uid) {

  let isAllRanks = true;

  for(let item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    if( this._rRankOwners[constants.RANKS[item]] != uid) {
      isAllRanks = false;
    }
  }

  if(isAllRanks) {
    this._rRankOwners[constants.ALMIGHTY] = uid;
  }
};