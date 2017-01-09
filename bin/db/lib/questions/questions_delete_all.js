const cdb = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

/*
 Очищаем таблицу Вопросы
 */
module.exports = function(callback) {
  let query = "truncate table " + dbConst.DB.QUESTIONS.name;
  
  cdb.client.execute(query, [], {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, null);
  });
};