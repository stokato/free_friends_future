/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 *  Получение статистики пользователя
 */
const db = require('./../../db_manager');
const PF = require('./../../const_fields');

module.exports = function (id, vid, callback) {
  
  let  fList = [
    PF.GIFTS_GIVEN,
    PF.GIFTS_TAKEN,
    PF.COINS_GIVEN,
    PF.COINS_EARNED,
    PF.COINS_SPENT,
    PF.BOTTLE_KISSED,
    PF.BEST_SELECTED,
    PF.RANK_GIVEN,
    PF.GAME_TIME
  ];
  
  db.findUserStat(id, vid, fList, function (err, stat) {
    if(err) {
      return callback(err);
    }
    
    callback(null, stat);
  })
};