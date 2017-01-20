const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

/*
 Очищаем таблицу Вопросы
 */
module.exports = function(callback) {
  let query = "truncate table " + DB_CONST.QUESTIONS.name;
  
  dbCtrlr.client.execute(query, [], {prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, null);
  });
};