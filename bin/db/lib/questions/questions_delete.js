var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.QUESTIONS.fields;

/*
 Удаляем вопрос из бд
 */
module.exports = function(idList, callback) {
  if (!idList) { callback(new Error("Не заданы ид вопросов")); }
  
  var constFields = [DBF.ID_uuid_p];
  var constValues = [idList.length];
  var params = [];
  var dbName = dbConst.DB.QUESTIONS.name;
  
  for(var i = 0; i < idList.length; i++) {
    params.push(idList[i]);
  }
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
  
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
};