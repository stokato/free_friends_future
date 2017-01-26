/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Добавляем / Редактируем общую статистику
 *
 */

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF       = require('./../../../const_fields');

module.exports = function(options, callback) { options = options || {};
  
  const DBF = DB_CONST.MAIN_STAT.fields;
  const DBN = DB_CONST.MAIN_STAT.name;
  
  if (!options[PF.ID]) {
    return callback(new Error("Задан пустой Id"), null);
  }
  
  let fieldsArr     = [];
  let condFieldsArr = [DBF.ID_varchar_p];
  let condValuesArr = [1];
  let paramsArr     = [];
  
  if (PF.GIFTS_LOVES in options)        { fieldsArr.push(DBF.C_GIFTS_LOVES_counter);       paramsArr.push(options[PF.GIFTS_LOVES]); }
  if (PF.GIFTS_BREATH in options)       { fieldsArr.push(DBF.C_GIFTS_BREATH_counter);      paramsArr.push(options[PF.GIFTS_BREATH]); }
  if (PF.GIFTS_FLOWERS in options)      { fieldsArr.push(DBF.C_GIFTS_FLOWERS_counter);     paramsArr.push(options[PF.GIFTS_FLOWERS]); }
  if (PF.GIFTS_DRINKS in options)       { fieldsArr.push(DBF.C_GIFTS_DRINKS_counter);      paramsArr.push(options[PF.GIFTS_DRINKS]); }
  if (PF.GIFTS_COMMON in options)       { fieldsArr.push(DBF.C_GIFTS_COMMON_counter);      paramsArr.push(options[PF.GIFTS_COMMON]); }
  if (PF.GIFTS_FLIRTATION in options)   { fieldsArr.push(DBF.C_GIFTS_FLIRTATION_counter);  paramsArr.push(options[PF.GIFTS_FLIRTATION]); }
  if (PF.GIFTS_MERRY in options)        { fieldsArr.push(DBF.C_GIFTS_MERRY_counter);       paramsArr.push(options[PF.GIFTS_MERRY]); }
  if (PF.GIFTS_HATS in options)         { fieldsArr.push(DBF.C_GIFTS_HATS_counter);        paramsArr.push(options[PF.GIFTS_HATS]); }
  if (PF.GIFTS_RANKS in options)        { fieldsArr.push(DBF.C_GIFTS_RANKS_counter);       paramsArr.push(options[PF.GIFTS_RANKS]); }
  if (PF.GIFTS_TO_AVATAR in options)    { fieldsArr.push(DBF.C_GIFTS_TO_AVATAR_counter);   paramsArr.push(options[PF.GIFTS_TO_AVATAR]); }
  if (PF.GIFTS_TEXT in options)         { fieldsArr.push(DBF.GIFTS_TEXT);                  paramsArr.push(options[PF.GIFTS_TEXT]); }
  if (PF.MONEY_1_GIVEN in options)      { fieldsArr.push(DBF.C_MONEY_1_GIVEN_counter);     paramsArr.push(options[PF.MONEY_1_GIVEN]); }
  if (PF.MONEY_3_GIVEN in options)      { fieldsArr.push(DBF.C_MONEY_3_GIVEN_counter);     paramsArr.push(options[PF.MONEY_3_GIVEN]); }
  if (PF.MONEY_10_GIVEN in options)     { fieldsArr.push(DBF.C_MONEY_10_GIVEN_counter);    paramsArr.push(options[PF.MONEY_10_GIVEN]); }
  if (PF.MONEY_20_GIVEN in options)     { fieldsArr.push(DBF.C_MONEY_20_GIVEN_counter);    paramsArr.push(options[PF.MONEY_20_GIVEN]); }
  if (PF.MONEY_60_GIVEN in options)     { fieldsArr.push(DBF.C_MONEY_60_GIVEN_counter);    paramsArr.push(options[PF.MONEY_60_GIVEN]); }
  if (PF.MONEY_200_GIVEN in options)    { fieldsArr.push(DBF.C_MONEY_200_GIVEN_counter);   paramsArr.push(options[PF.MONEY_200_GIVEN]); }
  if (PF.MONEY_1_TAKEN in options)      { fieldsArr.push(DBF.C_MONEY_1_TAKEN_counter);     paramsArr.push(options[PF.MONEY_1_TAKEN]); }
  if (PF.MONEY_3_TAKEN in options)      { fieldsArr.push(DBF.C_MONEY_3_TAKEN_counter);     paramsArr.push(options[PF.MONEY_3_TAKEN]); }
  if (PF.MONEY_10_TAKEN in options)     { fieldsArr.push(DBF.C_MONEY_10_TAKEN_counter);    paramsArr.push(options[PF.MONEY_10_TAKEN]); }
  if (PF.MONEY_20_TAKEN in options)     { fieldsArr.push(DBF.C_MONEY_20_TAKEN_counter);    paramsArr.push(options[PF.MONEY_20_TAKEN]); }
  if (PF.MONEY_60_TAKEN in options)     { fieldsArr.push(DBF.C_MONEY_60_TAKEN_counter);    paramsArr.push(options[PF.MONEY_60_TAKEN]); }
  if (PF.MONEY_200_TAKEN in options)    { fieldsArr.push(DBF.C_MONEY_200_TAKEN_counter);   paramsArr.push(options[PF.MONEY_200_TAKEN]); }
  if (PF.MENU_APPEND in options)        { fieldsArr.push(DBF.C_MENU_APPEND_counter);       paramsArr.push(options[PF.MENU_APPEND]); }
  if (PF.BEST_ACTIVITY in options)      { fieldsArr.push(DBF.C_BEST_ACTIVITY_counter);     paramsArr.push(options[PF.BEST_ACTIVITY]); }
  if (PF.BOTTLE_ACTIVITY in options)    { fieldsArr.push(DBF.C_BOTTLE_ACTIVITY_counter);   paramsArr.push(options[PF.BOTTLE_ACTIVITY]); }
  if (PF.CARDS_ACTIVITY in options)     { fieldsArr.push(DBF.C_CARDS_ACTIVITY_counter);    paramsArr.push(options[PF.CARDS_ACTIVITY]); }
  if (PF.QUESTION_ACITVITY in options)  { fieldsArr.push(DBF.C_QUESTION_ACITVITY_counter); paramsArr.push(options[PF.QUESTION_ACITVITY]); }
  if (PF.SYMPATHY_ACITVITY in options)  { fieldsArr.push(DBF.C_SYMPATHY_ACITVITY_counter); paramsArr.push(options[PF.SYMPATHY_ACITVITY]); }
  if (PF.COINS_EARNED in options)       { fieldsArr.push(DBF.C_COINS_EARNED_counter);      paramsArr.push(options[PF.COINS_EARNED]); }
  if (PF.COINS_SPENT in options)        { fieldsArr.push(DBF.C_COUNS_SPENT_counter);       paramsArr.push(options[PF.COINS_SPENT]); }
  
  paramsArr.push(options[PF.ID]);
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_UPDATE_COUNTER, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
  dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, options);
  });
};