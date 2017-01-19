const dbCtrlr     = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const DBF     = DB_CONST.QUESTIONS.fields;

/*
 Удаляем вопрос из бд
 */
module.exports = function(idList, callback) {
  if (!idList) { callback(new Error("Не заданы ид вопросов")); }
  
  let constFields = [DBF.ID_uuid_p];
  let constValues = [idList.length];
  let params = [];
  let dbName = DB_CONST.QUESTIONS.name;
  
  for(let i = 0; i < idList.length; i++) {
    params.push(idList[i]);
  }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
  
  dbCtrlr.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
};