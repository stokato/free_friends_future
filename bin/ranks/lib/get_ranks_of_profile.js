/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Получаем все ранги пользователя по его ИД
 */

var constants = require('./../../constants');

module.exports = function (uid) {
  
  var ranks = {};
  
  for(var item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    ranks[item] = (this._rankOwners[constants.RANKS[item]] == uid);
  }
  
  return ranks;
};
