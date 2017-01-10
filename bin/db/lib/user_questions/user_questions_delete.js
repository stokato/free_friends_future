/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Удаляем вопросы по списку ид из таблицы вопросов пользователей
 *
 */
const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF = dbConst.USER_QUESTIONS.fields;

module.exports = function(ids, callback) {
  if (!ids) { callback(new Error("Не заданы ид вопросов")); }
  
  let constFields = [DBF.ID_uuid_p];
  let constValues = [ids.length];
  let params = [];
  let dbName = dbConst.USER_QUESTIONS.name;
  
  for(let i = 0; i < ids.length; i++) {
    params.push(ids[i]);
  }
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
  
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
};