var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

// Добавить вопрос в БД
module.exports = function (options, callback) { options = options || {};
  
  if(!options.text) {
    return callback(new Error("Не задан текст сообщения"), null);
  }
  
  var id = cdb.uuid.random();

  var fields = ["id", "text"];
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_QUESTIONS);
  var params = [id, options["text"]];
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    options["id"] = id;
    callback(null, options);
  });

};
