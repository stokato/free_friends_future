/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Получаем статистику по пользователю
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');


module.exports = function(id, vid, f_list, callback) {
  
  const DBF = DB_CONST.USERS_STAT.fields;
  const DBN = DB_CONST.USERS_STAT.name;
    
  if (!vid || !id) {
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или VID"), null);
  }
  
  let paramsArr = [id, vid];
  
  let condFieldsArr = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  let condValuesArr = [1, 1];
  
  let fieldsArr = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  
  let listLen = f_list.length;
  for(let i = 0; i < listLen; i++) {
    switch (f_list[i]) {
      case PF.GIFTS_GIVEN    : fieldsArr.push(DBF.C_GIFTS_GIVEN_counter);    break;
      case PF.GIFTS_TAKEN    : fieldsArr.push(DBF.C_GIFTS_TAKEN_counter);    break;
      case PF.COINS_GIVEN    : fieldsArr.push(DBF.C_COINS_GIVEN_counter);    break;
      case PF.COINS_EARNED   : fieldsArr.push(DBF.C_COINS_EARNED_counter);   break;
      case PF.COINS_SPENT    : fieldsArr.push(DBF.C_COINS_SPENT_counter);    break;
      case PF.BOTTLE_KISSED  : fieldsArr.push(DBF.C_BOTTLE_KISSED_counter);  break;
      case PF.BEST_SELECTED  : fieldsArr.push(DBF.C_BEST_SELECTED_counter);  break;
      case PF.RANK_GIVEN     : fieldsArr.push(DBF.C_RANK_GIVEN_counter);     break;
      case PF.GAME_TIME      : fieldsArr.push(DBF.C_GAME_TIME_MS_counter);   break;
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
        [PF.ID]             : rowObj[DBF.ID_uuid_pc1i].toString(),
        [PF.VID]            : rowObj[DBF.VID_varchar_pc2i],
        [PF.GIFTS_GIVEN]    : rowObj[DBF.C_GIFTS_GIVEN_counter],
        [PF.GIFTS_TAKEN]    : rowObj[DBF.C_GIFTS_TAKEN_counter],
        [PF.COINS_GIVEN]    : rowObj[DBF.C_COINS_GIVEN_counter],
        [PF.COINS_EARNED]   : rowObj[DBF.C_COINS_EARNED_counter],
        [PF.COINS_SPENT]    : rowObj[DBF.C_COINS_SPENT_counter],
        [PF.BOTTLE_KISSED]  : rowObj[DBF.C_BOTTLE_KISSED_counter],
        [PF.BEST_SELECTED]  : rowObj[DBF.C_BEST_SELECTED_counter],
        [PF.RANK_GIVEN]     : rowObj[DBF.C_RANK_GIVEN_counter],
        [PF.GAME_TIME]      : rowObj[DBF.C_GAME_TIME_MS_counter]
      };
      
      callback(null, userObj);
    } else {
      callback(null, null);
    }
  });
};

