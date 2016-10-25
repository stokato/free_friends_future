var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Удаляем вопрос из бд
 */
module.exports = function(id, callback) {
  if (!id) { callback(new Error("Задан пустой Id")); }
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_QUESTIONS, ["id"], [1]);
  
  cdb.client.execute(query, [id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, id);
  });
};