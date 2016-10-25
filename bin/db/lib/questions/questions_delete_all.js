var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Очищаем таблицу Вопросы
 */
module.exports = function(callback) {
  var query = "truncate table " + constants.T_QUESTIONS;
  
  cdb.client.execute(query, [], {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
};