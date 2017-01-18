/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Получаем статистику по пользователю
 */

const cdb       = require('./../common/cassandra_db');
const dbConst   = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.USERS_STAT.fields;
const PF  = constants.PFIELDS;
const SF  = constants.SFIELDS;

module.exports = function(id, vid, f_list, callback) {
  if (!vid || !id) {
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или VID"), null);
  }

  let param = [id, vid];
  
  let contsFields = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  let constValues = [1, 1];
  let dbName = dbConst.USERS_STAT.name;
  
  let i, fields = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  for(i = 0; i < f_list.length; i++) {
    switch (f_list[i]) {
      case SF.GIFTS_GIVEN    : fields.push(DBF.C_GIFTS_GIVEN_counter);    break;
      case SF.GIFTS_TAKEN    : fields.push(DBF.C_GIFTS_TAKEN_counter);    break;
      case SF.COINS_GIVEN    : fields.push(DBF.C_COINS_GIVEN_counter);    break;
      case SF.COINS_EARNED   : fields.push(DBF.C_COINS_EARNED_counter);   break;
      case SF.COINS_SPENT    : fields.push(DBF.C_COINS_SPENT_counter);    break;
      case SF.BOTTLE_KISSED  : fields.push(DBF.C_BOTTLE_KISSED_counter);  break;
      case SF.BEST_SELECTED  : fields.push(DBF.C_BEST_SELECTED_counter);  break;
      case SF.RANK_GIVEN     : fields.push(DBF.C_RANK_GIVEN_counter);     break;
      case SF.GAME_TIME      : fields.push(DBF.C_GAME_TIME_MS_counter);   break;
    }
  }
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, contsFields, constValues);
  
  cdb.client.execute(query, param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    if(result.rows.length > 0) {
      
      let row = result.rows[0];
      
      let user = {
        [PF.ID]             : row[DBF.ID_uuid_pc1i].toString(),
        [PF.VID]            : row[DBF.VID_varchar_pc2i],
        [SF.GIFTS_GIVEN]    : row[DBF.C_GIFTS_GIVEN_counter],
        [SF.GIFTS_TAKEN]    : row[DBF.C_GIFTS_TAKEN_counter],
        [SF.COINS_GIVEN]    : row[DBF.C_COINS_GIVEN_counter],
        [SF.COINS_EARNED]   : row[DBF.C_COINS_EARNED_counter],
        [SF.COINS_SPENT]    : row[DBF.C_COINS_SPENT_counter],
        [SF.BOTTLE_KISSED]  : row[DBF.C_BOTTLE_KISSED_counter],
        [SF.BEST_SELECTED]  : row[DBF.C_BEST_SELECTED_counter],
        [SF.RANK_GIVEN]     : row[DBF.C_RANK_GIVEN_counter],
        [SF.GAME_TIME]      : row[DBF.C_GAME_TIME_MS_counter]
      };
      
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};
