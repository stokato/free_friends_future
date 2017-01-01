/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Получаем общую статистику
 *
 */

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.MAIN_STAT.fields;
var PF = dbConst.PFIELDS;
var SF = require('./../../../constants').SFIELDS;

module.exports = function(id, f_list, callback) {
  if (!id) {
    return callback(new Error("Ошибка при поиске статистики: Не задан ID"), null);
  }
  
  var param = [id];
  
  var contsFields = [DBF.ID_varchar_p];
  var constValues = [1];
  var dbName = dbConst.DB.MAIN_STAT.name;
  
  var i, fields = [DBF.ID_varchar_p];
  for(i = 0; i < f_list.length; i++) {
    switch (f_list[i]) {
      case SF.GIFTS_LOVES       : fields.push(DBF.C_GIFTS_LOVES_counter);       break;
      case SF.GIFTS_BREATH      : fields.push(DBF.C_GIFTS_BREATH_counter);      break;
      case SF.GIFTS_FLOWERS     : fields.push(DBF.C_GIFTS_FLOWERS_counter);     break;
      case SF.GIFTS_DRINKS      : fields.push(DBF.C_GIFTS_DRINKS_counter);      break;
      case SF.GIFTS_COMMON      : fields.push(DBF.C_GIFTS_COMMON_counter);      break;
      case SF.GIFTS_FLIRTATION  : fields.push(DBF.C_GIFTS_FLIRTATION_counter);  break;
      case SF.GIFTS_MERRY       : fields.push(DBF.C_GIFTS_MERRY_counter);       break;
      case SF.MONEY_1_GIVEN     : fields.push(DBF.C_MONEY_1_GIVEN_counter);     break;
      case SF.MONEY_3_GIVEN     : fields.push(DBF.C_MONEY_3_GIVEN_counter);     break;
      case SF.MONEY_10_GIVEN    : fields.push(DBF.C_MONEY_10_GIVEN_counter);    break;
      case SF.MONEY_20_GIVEN    : fields.push(DBF.C_MONEY_20_GIVEN_counter);    break;
      case SF.MONEY_60_GIVEN    : fields.push(DBF.C_MONEY_60_GIVEN_counter);    break;
      case SF.MONEY_200_GIVEN   : fields.push(DBF.C_MONEY_200_GIVEN_counter);   break;
      case SF.MONEY_1_TAKEN     : fields.push(DBF.C_MONEY_1_TAKEN_counter);     break;
      case SF.MONEY_3_TAKEN     : fields.push(DBF.C_MONEY_3_TAKEN_counter);     break;
      case SF.MONEY_10_TAKEN    : fields.push(DBF.C_MONEY_10_TAKEN_counter);    break;
      case SF.MONEY_20_TAKEN    : fields.push(DBF.C_MONEY_20_TAKEN_counter);    break;
      case SF.MONEY_60_TAKEN    : fields.push(DBF.C_MONEY_60_TAKEN_counter);    break;
      case SF.MONEY_200_TAKEN   : fields.push(DBF.C_MONEY_200_TAKEN_counter);   break;
      case SF.MENU_APPEND       : fields.push(DBF.C_MENU_APPEND_counter);       break;
      case SF.BEST_ACTIVITY     : fields.push(DBF.C_BEST_ACTIVITY_counter);     break;
      case SF.BOTTLE_ACTIVITY   : fields.push(DBF.C_BOTTLE_ACTIVITY_counter);   break;
      case SF.CARDS_ACTIVITY    : fields.push(DBF.C_CARDS_ACTIVITY_counter);    break;
      case SF.QUESTION_ACITVITY : fields.push(DBF.C_QUESTION_ACITVITY_counter); break;
      case SF.SYMPATHY_ACITVITY : fields.push(DBF.C_SYMPATHY_ACITVITY_counter); break;
      case SF.COINS_EARNED      : fields.push(DBF.C_COINS_EARNED_counter);      break;
      case SF.COINS_SPENT       : fields.push(DBF.C_COUNS_SPENT_counter);       break;
    }
  }
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, contsFields, constValues);
  
  cdb.client.execute(query, param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    if(result.rows.length > 0) {
      
      var row = result.rows[0];
      
      var user = {};
      user[PF.ID]                 = row[DBF.ID_varchar_p];
      user[SF.GIFTS_LOVES]        = row[DBF.C_GIFTS_LOVES_counter];
      user[SF.GIFTS_BREATH]       = row[DBF.C_GIFTS_BREATH_counter];
      user[SF.GIFTS_FLOWERS]      = row[DBF.C_GIFTS_FLOWERS_counter];
      user[SF.GIFTS_DRINKS]       = row[DBF.C_GIFTS_DRINKS_counter];
      user[SF.GIFTS_COMMON]       = row[DBF.C_GIFTS_COMMON_counter];
      user[SF.GIFTS_FLIRTATION]   = row[DBF.C_GIFTS_FLIRTATION_counter];
      user[SF.GIFTS_MERRY]        = row[DBF.C_GIFTS_MERRY_counter];
      user[SF.MONEY_1_GIVEN]      = row[DBF.C_MONEY_1_GIVEN_counter];
      user[SF.MONEY_3_GIVEN]      = row[DBF.C_MONEY_3_GIVEN_counter];
      user[SF.MONEY_10_GIVEN]     = row[DBF.C_MONEY_10_GIVEN_counter];
      user[SF.MONEY_20_GIVEN]     = row[DBF.C_MONEY_20_GIVEN_counter];
      user[SF.MONEY_60_GIVEN]     = row[DBF.C_MONEY_60_GIVEN_counter];
      user[SF.MONEY_200_GIVEN]    = row[DBF.C_MONEY_200_GIVEN_counter];
      user[SF.MONEY_1_TAKEN]      = row[DBF.C_MONEY_1_TAKEN_counter];
      user[SF.MONEY_3_TAKEN]      = row[DBF.C_MONEY_3_TAKEN_counter];
      user[SF.MONEY_10_TAKEN]     = row[DBF.C_MONEY_10_TAKEN_counter];
      user[SF.MONEY_20_TAKEN]     = row[DBF.C_MONEY_20_TAKEN_counter];
      user[SF.MONEY_60_TAKEN]     = row[DBF.C_MONEY_60_TAKEN_counter];
      user[SF.MONEY_200_TAKEN]    = row[DBF.C_MONEY_200_TAKEN_counter];
      user[SF.MENU_APPEND]        = row[DBF.C_MENU_APPEND_counter];
      user[SF.BEST_ACTIVITY]      = row[DBF.C_BEST_ACTIVITY_counter];
      user[SF.BOTTLE_ACTIVITY]    = row[DBF.C_BOTTLE_ACTIVITY_counter];
      user[SF.CARDS_ACTIVITY]     = row[DBF.C_CARDS_ACTIVITY_counter];
      user[SF.QUESTION_ACITVITY]  = row[DBF.C_QUESTION_ACITVITY_counter];
      user[SF.SYMPATHY_ACITVITY]  = row[DBF.C_SYMPATHY_ACITVITY_counter];
      user[SF.COINS_EARNED]       = row[DBF.C_COINS_EARNED_counter];
      user[SF.COINS_SPENT]        = row[DBF.C_COUNS_SPENT_counter];
      
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};
