/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 *  Получение статистики пользователя
 */
var db = require('./../../db_manager');
var SF = require('./../../constants').SFIELDS;

module.exports = function (id, vid, callback) {
  
  var fList = [
    SF.GIFTS_GIVEN,
    SF.GIFTS_TAKEN,
    SF.COINS_GIVEN,
    SF.COINS_EARNED,
    SF.COINS_SPENT,
    SF.BOTTLE_KISSED,
    SF.BEST_SELECTED,
    SF.RANK_GIVEN,
    SF.GAME_TIME
  ];
  
  db.findUserStat(id, vid, fList, function (err, stat) {
    if(err) { return callback(err); }
    
    callback(null, stat);
  })
};