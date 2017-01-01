/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Добавляем / Редактируем общую статистику
 *
 */

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.MAIN_STAT.fields;
var PF = dbConst.PFIELDS;
var SF = require('./../../../constants').SFIELDS;

module.exports = function(options, callback) { options = options || {};
  
  if (!options[PF.ID]) {
    return callback(new Error("Задан пустой Id"), null);
  }
  
  var fields = [];
  var constFields = [DBF.ID_varchar_p];
  var constValues = [1];
  var dbName = dbConst.DB.MAIN_STAT.name;
  
  var params = [];
  if (SF.GIFTS_LOVES in options)        { fields.push(DBF.C_GIFTS_LOVES_counter);       params.push(options[SF.GIFTS_LOVES]); }
  if (SF.GIFTS_BREATH in options)       { fields.push(DBF.C_GIFTS_BREATH_counter);      params.push(options[SF.GIFTS_BREATH]); }
  if (SF.GIFTS_FLOWERS in options)      { fields.push(DBF.C_GIFTS_FLOWERS_counter);     params.push(options[SF.GIFTS_FLOWERS]); }
  if (SF.GIFTS_DRINKS in options)       { fields.push(DBF.C_GIFTS_DRINKS_counter);      params.push(options[SF.GIFTS_DRINKS]); }
  if (SF.GIFTS_COMMON in options)       { fields.push(DBF.C_GIFTS_COMMON_counter);      params.push(options[SF.GIFTS_COMMON]); }
  if (SF.GIFTS_FLIRTATION in options)   { fields.push(DBF.C_GIFTS_FLIRTATION_counter);  params.push(options[SF.GIFTS_FLIRTATION]); }
  if (SF.GIFTS_MERRY in options)        { fields.push(DBF.C_GIFTS_MERRY_counter);       params.push(options[SF.GIFTS_MERRY]); }
  if (SF.MONEY_1_GIVEN in options)      { fields.push(DBF.C_MONEY_1_GIVEN_counter);     params.push(options[SF.MONEY_1_GIVEN]); }
  if (SF.MONEY_3_GIVEN in options)      { fields.push(DBF.C_MONEY_3_GIVEN_counter);     params.push(options[SF.MONEY_3_GIVEN]); }
  if (SF.MONEY_10_GIVEN in options)     { fields.push(DBF.C_MONEY_10_GIVEN_counter);    params.push(options[SF.MONEY_10_GIVEN]); }
  if (SF.MONEY_20_GIVEN in options)     { fields.push(DBF.C_MONEY_20_GIVEN_counter);    params.push(options[SF.MONEY_20_GIVEN]); }
  if (SF.MONEY_60_GIVEN in options)     { fields.push(DBF.C_MONEY_60_GIVEN_counter);    params.push(options[SF.MONEY_60_GIVEN]); }
  if (SF.MONEY_200_GIVEN in options)    { fields.push(DBF.C_MONEY_200_GIVEN_counter);   params.push(options[SF.MONEY_200_GIVEN]); }
  if (SF.MONEY_1_TAKEN in options)      { fields.push(DBF.C_MONEY_1_TAKEN_counter);     params.push(options[SF.MONEY_1_TAKEN]); }
  if (SF.MONEY_3_TAKEN in options)      { fields.push(DBF.C_MONEY_3_TAKEN_counter);     params.push(options[SF.MONEY_3_TAKEN]); }
  if (SF.MONEY_10_TAKEN in options)     { fields.push(DBF.C_MONEY_10_TAKEN_counter);    params.push(options[SF.MONEY_10_TAKEN]); }
  if (SF.MONEY_20_TAKEN in options)     { fields.push(DBF.C_MONEY_20_TAKEN_counter);    params.push(options[SF.MONEY_20_TAKEN]); }
  if (SF.MONEY_60_TAKEN in options)     { fields.push(DBF.C_MONEY_60_TAKEN_counter);    params.push(options[SF.MONEY_60_TAKEN]); }
  if (SF.MONEY_200_TAKEN in options)    { fields.push(DBF.C_MONEY_200_TAKEN_counter);   params.push(options[SF.MONEY_200_TAKEN]); }
  if (SF.MENU_APPEND in options)        { fields.push(DBF.C_MENU_APPEND_counter);       params.push(options[SF.MENU_APPEND]); }
  if (SF.BEST_ACTIVITY in options)      { fields.push(DBF.C_BEST_ACTIVITY_counter);     params.push(options[SF.BEST_ACTIVITY]); }
  if (SF.BOTTLE_ACTIVITY in options)    { fields.push(DBF.C_BOTTLE_ACTIVITY_counter);   params.push(options[SF.BOTTLE_ACTIVITY]); }
  if (SF.CARDS_ACTIVITY in options)     { fields.push(DBF.C_CARDS_ACTIVITY_counter);    params.push(options[SF.CARDS_ACTIVITY]); }
  if (SF.QUESTION_ACITVITY in options)  { fields.push(DBF.C_QUESTION_ACITVITY_counter); params.push(options[SF.QUESTION_ACITVITY]); }
  if (SF.SYMPATHY_ACITVITY in options)  { fields.push(DBF.C_SYMPATHY_ACITVITY_counter); params.push(options[SF.SYMPATHY_ACITVITY]); }
  if (SF.COINS_EARNED in options)       { fields.push(DBF.C_COINS_EARNED_counter);      params.push(options[SF.COINS_EARNED]); }
  if (SF.COINS_SPENT in options)        { fields.push(DBF.C_COUNS_SPENT_counter);       params.push(options[SF.COINS_SPENT]); }
    
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE_COUNTER, fields, dbName, constFields, constValues);
  
  params.push(options[PF.ID]);
  
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, options);
  });
};