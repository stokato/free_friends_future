const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const DBF     = dbConst.QUESTIONS.fields;

/*
 Удаляем вопрос из бд
 */
module.exports = function(idList, callback) {
  if (!idList) { callback(new Error("Не заданы ид вопросов")); }
  
  let constFields = [DBF.ID_uuid_p];
  let constValues = [idList.length];
  let params = [];
  let dbName = dbConst.QUESTIONS.name;
  
  for(let i = 0; i < idList.length; i++) {
    params.push(idList[i]);
  }
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
  
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
};