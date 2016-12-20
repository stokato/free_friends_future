/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Удаляем вопросы по списку ид из таблицы вопросов пользователей
 *
 */
var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_QUESTIONS.fields;

module.exports = function(ids, callback) {
  if (!ids) { callback(new Error("Не заданы ид вопросов")); }
  
  var constFields = [DBF.ID_uuid_p];
  var constValues = [ids.length];
  var params = [];
  var dbName = dbConst.DB.USER_QUESTIONS.name;
  
  for(var i = 0; i < ids.length; i++) {
    params.push(ids[i]);
  }
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
  
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
};