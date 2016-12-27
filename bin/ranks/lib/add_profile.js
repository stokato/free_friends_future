/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем профиль к списку
 */

const constants = require('./../../constants');

module.exports = function (uid) {
  this._profiles[uid] = {};
  for(let item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    this._profiles[uid][constants.RANKS[item]] = 0;
  }
};