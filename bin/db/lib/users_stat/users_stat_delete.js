/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Удаляем статистику по пользователю
 *
 */

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');


module.exports = function(id, vid, callback) {
  
  const DBF = DB_CONST.USERS_STAT.fields;
  const DBN = DB_CONST.USERS_STAT.name;
  
  if (!id) {
    return callback(new Error("Задан пустой ID или VID"));
  }
  
  let condFieldsArr = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  let condValuesArr = [1, 1];
  let paramsArr     = [id];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);
  
  dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, id);
  });
};
