const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

// Добавить вопрос в БД
module.exports = function (options, callback) { options = options || {};
  
  const DBF = DB_CONST.QUESTIONS.fields;
  const DBN = DB_CONST.QUESTIONS.name;
  
  if(!options[PF.TEXT] ||
    !options[PF.IMAGE_1] ||
    !options[PF.IMAGE_2] ||
    !options[PF.IMAGE_3]) {
    return callback(new Error("Не задан текст сообщения или изображение"), null);
  }
  
  let id = dbCtrlr.uuid.random();
  
  let fieldsArr = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar,
    DBF.ACTIVITY_boolean
  ];
  
  let paramsArr = [
    id,
    options[PF.TEXT],
    options[PF.IMAGE_1],
    options[PF.IMAGE_2],
    options[PF.IMAGE_3],
    !!options[PF.ACTIVITY]
  ];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBN);
  
  dbCtrlr.client.execute(query, paramsArr, { prepare: true },  (err) => {
    if (err) {
      return callback(err);
    }
    
    options[PF.ID] = id;
    
    callback(null, options);
  });
};

