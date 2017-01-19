/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Получаем статистику по пользователю
 */

const dbCtrlr       = require('./../common/cassandra_db');
const DB_CONST   = require('./../../constants');
const PF = require('./../../../const_fields');

const DBF = DB_CONST.USERS_STAT.fields;

module.exports = function(id, vid, f_list, callback) {
  if (!vid || !id) {
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или VID"), null);
  }

  let param = [id, vid];
  
  let contsFields = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  let constValues = [1, 1];
  let dbName = DB_CONST.USERS_STAT.name;
  
  let i, fields = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  for(i = 0; i < f_list.length; i++) {
    switch (f_list[i]) {
      case PF.GIFTS_GIVEN    : fields.push(DBF.C_GIFTS_GIVEN_counter);    break;
      case PF.GIFTS_TAKEN    : fields.push(DBF.C_GIFTS_TAKEN_counter);    break;
      case PF.COINS_GIVEN    : fields.push(DBF.C_COINS_GIVEN_counter);    break;
      case PF.COINS_EARNED   : fields.push(DBF.C_COINS_EARNED_counter);   break;
      case PF.COINS_SPENT    : fields.push(DBF.C_COINS_SPENT_counter);    break;
      case PF.BOTTLE_KISSED  : fields.push(DBF.C_BOTTLE_KISSED_counter);  break;
      case PF.BEST_SELECTED  : fields.push(DBF.C_BEST_SELECTED_counter);  break;
      case PF.RANK_GIVEN     : fields.push(DBF.C_RANK_GIVEN_counter);     break;
      case PF.GAME_TIME      : fields.push(DBF.C_GAME_TIME_MS_counter);   break;
    }
  }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fields, dbName, contsFields, constValues);
  
  dbCtrlr.client.execute(query, param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    if(result.rows.length > 0) {
      
      let row = result.rows[0];
      
      let user = {
        [PF.ID]             : row[DBF.ID_uuid_pc1i].toString(),
        [PF.VID]            : row[DBF.VID_varchar_pc2i],
        [PF.GIFTS_GIVEN]    : row[DBF.C_GIFTS_GIVEN_counter],
        [PF.GIFTS_TAKEN]    : row[DBF.C_GIFTS_TAKEN_counter],
        [PF.COINS_GIVEN]    : row[DBF.C_COINS_GIVEN_counter],
        [PF.COINS_EARNED]   : row[DBF.C_COINS_EARNED_counter],
        [PF.COINS_SPENT]    : row[DBF.C_COINS_SPENT_counter],
        [PF.BOTTLE_KISSED]  : row[DBF.C_BOTTLE_KISSED_counter],
        [PF.BEST_SELECTED]  : row[DBF.C_BEST_SELECTED_counter],
        [PF.RANK_GIVEN]     : row[DBF.C_RANK_GIVEN_counter],
        [PF.GAME_TIME]      : row[DBF.C_GAME_TIME_MS_counter]
      };
      
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};

