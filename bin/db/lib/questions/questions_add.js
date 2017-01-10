const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.QUESTIONS.fields;
const PF  = constants.PFIELDS;

// Добавить вопрос в БД
module.exports = function (options, callback) { options = options || {};
  
  if(!options[PF.TEXT] || !options[PF.IMAGE_1] || !options[PF.IMAGE_2] || !options[PF.IMAGE_3]) {
    return callback(new Error("Не задан текст сообщения или изображение"), null);
  }
  
  let id = cdb.uuid.random();

  let fields = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar,
    DBF.ACTIVITY_boolean
  ];
  
  let params = [
    id,
    options[PF.TEXT],
    options[PF.IMAGE_1],
    options[PF.IMAGE_2],
    options[PF.IMAGE_3],
    !!options[PF.ACTIVITY]
  ];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.QUESTIONS.name);
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    options[PF.ID] = id;
    
    callback(null, options);
  });

};
