/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Получаем общую статистику
 */

var db = require('./../../db_manager');
var constants = require('./../../constants');
var SF = constants.SFIELDS;
var PF = constants.PFIELDS;

module.exports = function (callback) {
  
  var id = 'main';
  var fList = [
    SF.GIFTS_LOVES,
    SF.GIFTS_BREATH,
    SF.GIFTS_DRINKS,
    SF.GIFTS_COMMON,
    SF.GIFTS_FLIRTATION,
    SF.GIFTS_MERRY,
    SF.MONEY_1_GIVEN,
    SF.MONEY_3_GIVEN,
    SF.MONEY_10_GIVEN,
    SF.MONEY_20_GIVEN,
    SF.MONEY_60_GIVEN,
    SF.MONEY_200_GIVEN,
    SF.MONEY_1_TAKEN,
    SF.MONEY_3_TAKEN,
    SF.MONEY_10_TAKEN,
    SF.MONEY_20_TAKEN,
    SF.MONEY_60_TAKEN,
    SF.MONEY_200_TAKEN,
    SF.MENU_APPEND,
    SF.BEST_ACTIVITY,
    SF.BOTTLE_ACTIVITY,
    SF.CARDS_ACTIVITY,
    SF.QUESTION_ACITVITY,
    SF.SYMPATHY_ACITVITY,
    SF.COINS_EARNED,
    SF.COINS_SPENT
  ];
  
  db.findMainStat(id, fList, function (err, stat) {
    if(err) { return callback(err); }
    
    delete stat[PF.ID];
    
    callback(null, stat);
  })
};
