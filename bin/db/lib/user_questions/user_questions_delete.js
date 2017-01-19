/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Удаляем вопросы по списку ид из таблицы вопросов пользователей
 *
 */
const dbCtrlr     = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

const DBF = DB_CONST.USER_QUESTIONS.fields;

module.exports = function(ids, callback) {
  if (!ids) { callback(new Error("Не заданы ид вопросов")); }
  
  let constFields = [DBF.ID_uuid_p];
  let constValues = [ids.length];
  let params = [];
  let dbName = DB_CONST.USER_QUESTIONS.name;
  
  for(let i = 0; i < ids.length; i++) {
    params.push(ids[i]);
  }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
  
  dbCtrlr.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
};