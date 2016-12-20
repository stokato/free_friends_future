/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем в базу вопрос пользователя
 *
 */
var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_QUESTIONS.fields;
var PF = dbConst.PFIELDS;

module.exports = function (uid, options, callback) { options = options || {};
  
  if(!options[PF.TEXT] || !options[PF.IMAGE_1] || !options[PF.IMAGE_2] || !options[PF.IMAGE_3] || !options[PF.FVID]) {
    return callback(new Error("Не задан текст сообщения или изображение"), null);
  }
  
  var id = cdb.uuid.random();
  
  var fields = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar,
    DBF.USERID_uuid,
    DBF.USERVID_varchar
  ];
  
  var params = [
    id,
    options[PF.TEXT],
    options[PF.IMAGE_1],
    options[PF.IMAGE_2],
    options[PF.IMAGE_3],
    uid,
    options[PF.FVID]
  ];
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_QUESTIONS.name);
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    options[PF.ID] = id;
    
    callback(null, options);
  });
  
};
