var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.QUESTIONS.fields;
var PF = dbConst.PFIELDS;

// Добавить вопрос в БД
module.exports = function (options, callback) { options = options || {};
  
  if(!options[PF.TEXT] || !options[PF.IMAGE_1] || !options[PF.IMAGE_2] || !options[PF.IMAGE_3]) {
    return callback(new Error("Не задан текст сообщения или изображение"), null);
  }
  
  var id = cdb.uuid.random();

  var fields = [DBF.ID_uuid_p, DBF.TEXT_varchar, DBF.IMAGE1_varchar, DBF.IMAGE2_varchar, DBF.IMAGE3_varchar];
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.QUESTIONS.name);
  var params = [id, options[PF.TEXT], options[PF.IMAGE_1], options[PF.IMAGE_2], options[PF.IMAGE_3]];
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    options[PF.ID] = id;
    
    callback(null, options);
  });

};
