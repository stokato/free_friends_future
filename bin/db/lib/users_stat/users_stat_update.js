/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Добавляем / редактируем  данные статистики по пользователю
 */

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USERS_STAT.fields;
var PF = dbConst.PFIELDS;
var SF = dbConst.SFIELDS;

module.exports = function(options, callback) { options = options || {};
  
  if (!options[PF.ID] || !options[PF.VID]) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }
  
  var fields = [];
  var constFields = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  var constValues = [1, 1];
  var dbName = dbConst.DB.USERS_STAT.name;
  
  var params = [];
  if (SF.GIFTS_GIVEN in options)   { fields.push(DBF.C_GIFTS_GIVEN_counter);   params.push(options[SF.GIFTS_GIVEN]); }
  if (SF.GIFTS_TAKEN in options)   { fields.push(DBF.C_GIFTS_TAKEN_counter);   params.push(options[SF.GIFTS_TAKEN]); }
  if (SF.COINS_GIVEN in options)   { fields.push(DBF.C_COINS_GIVEN_counter);   params.push(options[SF.COINS_GIVEN]); }
  if (SF.COINS_EARNED in options)  { fields.push(DBF.C_COINS_EARNED_counter);  params.push(options[SF.COINS_EARNED]); }
  if (SF.COINS_SPENT in options)   { fields.push(DBF.C_COINS_SPENT_counter);   params.push(options[SF.COINS_SPENT]); }
  if (SF.BOTTLE_KISSED in options) { fields.push(DBF.C_BOTTLE_KISSED_counter); params.push(options[SF.BOTTLE_KISSED]); }
  if (SF.BEST_SELECTED in options) { fields.push(DBF.C_BEST_SELECTED_counter); params.push(options[SF.BEST_SELECTED]); }
  if (SF.RANK_GIVEN in options)    { fields.push(DBF.C_RANK_GIVEN_counter);    params.push(options[SF.RANK_GIVEN]); }
  if (SF.GAME_TIME in options)     { fields.push(DBF.C_GAME_TIME_MS_counter);  params.push(options[SF.GAME_TIME]); }
    
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE_COUNTER, fields, dbName, constFields, constValues);
  
  params.push(options[PF.ID]);
  params.push(options[PF.VID]);
  
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, options);
  });
};