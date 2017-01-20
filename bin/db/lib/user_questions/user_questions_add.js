/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем в базу вопрос пользователя
 *
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

module.exports = function (uid, options, callback) { options = options || {};
  
  const DBF = DB_CONST.USER_QUESTIONS.fields;
  const DBN = DB_CONST.USER_QUESTIONS.name;
  
  if(!options[PF.TEXT] ||
      !options[PF.IMAGE_1] ||
      !options[PF.IMAGE_2] ||
      !options[PF.IMAGE_3] ||
      !options[PF.FVID]) {
    return callback(new Error("Не задан текст сообщения или изображение"), null);
  }
  
  let id = dbCtrlr.uuid.random();
  
  let fieldsArr = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar,
    DBF.USERID_uuid,
    DBF.USERVID_varchar
  ];
  
  let paramsArr = [
    id,
    options[PF.TEXT],
    options[PF.IMAGE_1],
    options[PF.IMAGE_2],
    options[PF.IMAGE_3],
    uid,
    options[PF.FVID]
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
