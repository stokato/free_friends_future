/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Получаем общую статистику
 */

const db = require('./../../db_manager');
const PF = require('./../../const_fields');


module.exports = function (callback) {
  
  let  id = 'main';
  let  fList = [
    PF.GIFTS_LOVES,
    PF.GIFTS_BREATH,
    PF.GIFTS_DRINKS,
    PF.GIFTS_COMMON,
    PF.GIFTS_FLIRTATION,
    PF.GIFTS_MERRY,
    PF.MONEY_1_GIVEN,
    PF.MONEY_3_GIVEN,
    PF.MONEY_10_GIVEN,
    PF.MONEY_20_GIVEN,
    PF.MONEY_60_GIVEN,
    PF.MONEY_200_GIVEN,
    PF.MONEY_1_TAKEN,
    PF.MONEY_3_TAKEN,
    PF.MONEY_10_TAKEN,
    PF.MONEY_20_TAKEN,
    PF.MONEY_60_TAKEN,
    PF.MONEY_200_TAKEN,
    PF.MENU_APPEND,
    PF.BEST_ACTIVITY,
    PF.BOTTLE_ACTIVITY,
    PF.CARDS_ACTIVITY,
    PF.QUESTION_ACITVITY,
    PF.SYMPATHY_ACITVITY,
    PF.COINS_EARNED,
    PF.COINS_SPENT
  ];
  
  db.findMainStat(id, fList, function (err, stat) {
    if(err) {
      return callback(err);
    }
    
    delete stat[PF.ID];
    
    callback(null, stat);
  })
};
