/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Добавляем / редактируем  данные статистики по пользователю
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

module.exports = function(options, callback) { options = options || {};
  
  const DBF = DB_CONST.USERS_STAT.fields;
  const DBN = DB_CONST.USERS_STAT.name;
  
  if (!options[PF.ID] || !options[PF.VID]) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }
  
  let fieldsArr     = [];
  let condFielsArr  = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  let condValuesArr = [1, 1];
  
  let paramsArr = [];
  if (PF.GIFTS_GIVEN in options)   { fieldsArr.push(DBF.C_GIFTS_GIVEN_counter);   paramsArr.push(options[PF.GIFTS_GIVEN]); }
  if (PF.GIFTS_TAKEN in options)   { fieldsArr.push(DBF.C_GIFTS_TAKEN_counter);   paramsArr.push(options[PF.GIFTS_TAKEN]); }
  if (PF.COINS_GIVEN in options)   { fieldsArr.push(DBF.C_COINS_GIVEN_counter);   paramsArr.push(options[PF.COINS_GIVEN]); }
  if (PF.COINS_EARNED in options)  { fieldsArr.push(DBF.C_COINS_EARNED_counter);  paramsArr.push(options[PF.COINS_EARNED]); }
  if (PF.COINS_SPENT in options)   { fieldsArr.push(DBF.C_COINS_SPENT_counter);   paramsArr.push(options[PF.COINS_SPENT]); }
  if (PF.BOTTLE_KISSED in options) { fieldsArr.push(DBF.C_BOTTLE_KISSED_counter); paramsArr.push(options[PF.BOTTLE_KISSED]); }
  if (PF.BEST_SELECTED in options) { fieldsArr.push(DBF.C_BEST_SELECTED_counter); paramsArr.push(options[PF.BEST_SELECTED]); }
  if (PF.RANK_GIVEN in options)    { fieldsArr.push(DBF.C_RANK_GIVEN_counter);    paramsArr.push(options[PF.RANK_GIVEN]); }
  if (PF.GAME_TIME in options)     { fieldsArr.push(DBF.C_GAME_TIME_MS_counter);  paramsArr.push(options[PF.GAME_TIME]); }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_UPDATE_COUNTER, fieldsArr, DBN, condFielsArr, condValuesArr);
  
  paramsArr.push(options[PF.ID]);
  paramsArr.push(options[PF.VID]);
  
  dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, options);
  });
};