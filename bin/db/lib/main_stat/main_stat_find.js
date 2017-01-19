/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Получаем общую статистику
 *
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

module.exports = function(id, f_list, callback) {
  
  const DBF = DB_CONST.MAIN_STAT.fields;
  const DBN = DB_CONST.MAIN_STAT.name;
  
  if (!id) {
    return callback(new Error("Ошибка при поиске статистики: Не задан ID"), null);
  }
  
  let paramsArr = [id];
  
  let condFieldsArr = [DBF.ID_varchar_p];
  let condValuesArr = [1];
  
  let fieldsArr = [DBF.ID_varchar_p];
  
  let listLen = f_list.length;
  for(let i = 0; i < listLen; i++) {
    switch (f_list[i]) {
      case PF.GIFTS_LOVES       : fieldsArr.push(DBF.C_GIFTS_LOVES_counter);       break;
      case PF.GIFTS_BREATH      : fieldsArr.push(DBF.C_GIFTS_BREATH_counter);      break;
      case PF.GIFTS_FLOWERS     : fieldsArr.push(DBF.C_GIFTS_FLOWERS_counter);     break;
      case PF.GIFTS_DRINKS      : fieldsArr.push(DBF.C_GIFTS_DRINKS_counter);      break;
      case PF.GIFTS_COMMON      : fieldsArr.push(DBF.C_GIFTS_COMMON_counter);      break;
      case PF.GIFTS_FLIRTATION  : fieldsArr.push(DBF.C_GIFTS_FLIRTATION_counter);  break;
      case PF.GIFTS_MERRY       : fieldsArr.push(DBF.C_GIFTS_MERRY_counter);       break;
      case PF.MONEY_1_GIVEN     : fieldsArr.push(DBF.C_MONEY_1_GIVEN_counter);     break;
      case PF.MONEY_3_GIVEN     : fieldsArr.push(DBF.C_MONEY_3_GIVEN_counter);     break;
      case PF.MONEY_10_GIVEN    : fieldsArr.push(DBF.C_MONEY_10_GIVEN_counter);    break;
      case PF.MONEY_20_GIVEN    : fieldsArr.push(DBF.C_MONEY_20_GIVEN_counter);    break;
      case PF.MONEY_60_GIVEN    : fieldsArr.push(DBF.C_MONEY_60_GIVEN_counter);    break;
      case PF.MONEY_200_GIVEN   : fieldsArr.push(DBF.C_MONEY_200_GIVEN_counter);   break;
      case PF.MONEY_1_TAKEN     : fieldsArr.push(DBF.C_MONEY_1_TAKEN_counter);     break;
      case PF.MONEY_3_TAKEN     : fieldsArr.push(DBF.C_MONEY_3_TAKEN_counter);     break;
      case PF.MONEY_10_TAKEN    : fieldsArr.push(DBF.C_MONEY_10_TAKEN_counter);    break;
      case PF.MONEY_20_TAKEN    : fieldsArr.push(DBF.C_MONEY_20_TAKEN_counter);    break;
      case PF.MONEY_60_TAKEN    : fieldsArr.push(DBF.C_MONEY_60_TAKEN_counter);    break;
      case PF.MONEY_200_TAKEN   : fieldsArr.push(DBF.C_MONEY_200_TAKEN_counter);   break;
      case PF.MENU_APPEND       : fieldsArr.push(DBF.C_MENU_APPEND_counter);       break;
      case PF.BEST_ACTIVITY     : fieldsArr.push(DBF.C_BEST_ACTIVITY_counter);     break;
      case PF.BOTTLE_ACTIVITY   : fieldsArr.push(DBF.C_BOTTLE_ACTIVITY_counter);   break;
      case PF.CARDS_ACTIVITY    : fieldsArr.push(DBF.C_CARDS_ACTIVITY_counter);    break;
      case PF.QUESTION_ACITVITY : fieldsArr.push(DBF.C_QUESTION_ACITVITY_counter); break;
      case PF.SYMPATHY_ACITVITY : fieldsArr.push(DBF.C_SYMPATHY_ACITVITY_counter); break;
      case PF.COINS_EARNED      : fieldsArr.push(DBF.C_COINS_EARNED_counter);      break;
      case PF.COINS_SPENT       : fieldsArr.push(DBF.C_COUNS_SPENT_counter);       break;
    }
  }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
  dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    
    if(result.rows.length > 0) {
      
      let rowObj = result.rows[0];
      
      let userObj = {
        [PF.ID]                : rowObj[DBF.ID_varchar_p],
        [PF.GIFTS_LOVES]       : rowObj[DBF.C_GIFTS_LOVES_counter],
        [PF.GIFTS_BREATH]      : rowObj[DBF.C_GIFTS_BREATH_counter],
        [PF.GIFTS_FLOWERS]     : rowObj[DBF.C_GIFTS_FLOWERS_counter],
        [PF.GIFTS_DRINKS]      : rowObj[DBF.C_GIFTS_DRINKS_counter],
        [PF.GIFTS_COMMON]      : rowObj[DBF.C_GIFTS_COMMON_counter],
        [PF.GIFTS_FLIRTATION]  : rowObj[DBF.C_GIFTS_FLIRTATION_counter],
        [PF.GIFTS_MERRY]       : rowObj[DBF.C_GIFTS_MERRY_counter],
        [PF.MONEY_1_GIVEN]     : rowObj[DBF.C_MONEY_1_GIVEN_counter],
        [PF.MONEY_3_GIVEN]     : rowObj[DBF.C_MONEY_3_GIVEN_counter],
        [PF.MONEY_10_GIVEN]    : rowObj[DBF.C_MONEY_10_GIVEN_counter],
        [PF.MONEY_20_GIVEN]    : rowObj[DBF.C_MONEY_20_GIVEN_counter],
        [PF.MONEY_60_GIVEN]    : rowObj[DBF.C_MONEY_60_GIVEN_counter],
        [PF.MONEY_200_GIVEN]   : rowObj[DBF.C_MONEY_200_GIVEN_counter],
        [PF.MONEY_1_TAKEN]     : rowObj[DBF.C_MONEY_1_TAKEN_counter],
        [PF.MONEY_3_TAKEN]     : rowObj[DBF.C_MONEY_3_TAKEN_counter],
        [PF.MONEY_10_TAKEN]    : rowObj[DBF.C_MONEY_10_TAKEN_counter],
        [PF.MONEY_20_TAKEN]    : rowObj[DBF.C_MONEY_20_TAKEN_counter],
        [PF.MONEY_60_TAKEN]    : rowObj[DBF.C_MONEY_60_TAKEN_counter],
        [PF.MONEY_200_TAKEN]   : rowObj[DBF.C_MONEY_200_TAKEN_counter],
        [PF.MENU_APPEND]       : rowObj[DBF.C_MENU_APPEND_counter],
        [PF.BEST_ACTIVITY]     : rowObj[DBF.C_BEST_ACTIVITY_counter],
        [PF.BOTTLE_ACTIVITY]   : rowObj[DBF.C_BOTTLE_ACTIVITY_counter],
        [PF.CARDS_ACTIVITY]    : rowObj[DBF.C_CARDS_ACTIVITY_counter],
        [PF.QUESTION_ACITVITY] : rowObj[DBF.C_QUESTION_ACITVITY_counter],
        [PF.SYMPATHY_ACITVITY] : rowObj[DBF.C_SYMPATHY_ACITVITY_counter],
        [PF.COINS_EARNED]      : rowObj[DBF.C_COINS_EARNED_counter],
        [PF.COINS_SPENT]       : rowObj[DBF.C_COUNS_SPENT_counter]
      };
      
      callback(null, userObj);
    } else {
      callback(null, null);
    }
  });
};
