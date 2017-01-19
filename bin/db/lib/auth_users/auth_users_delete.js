/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Удаляем регистрацию пользователя
 *
 */

const dbCtrlr = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

module.exports = function(id, callback) {
  
  const DBF     = DB_CONST.USERS.fields;
  const DBNAME  = DB_CONST.AUTH_USERS.name;
  
  if (!id) {
    return callback(new Error("Задан пустой Id"));
  }
  
  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [1];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBNAME, condFieldsArr, condValuesArr );
  
  dbCtrlr.client.execute(query, [id], { prepare: true }, (err) => {
    if (err) {  return callback(err); }
    
    callback(null, id);
  });
};
