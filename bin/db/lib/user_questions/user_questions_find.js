/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Получаем вопросы пользователей по списку ид, либо просто порцию
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

module.exports = function(IDArr, callback) {
  
  const DBF = DB_CONST.USER_QUESTIONS.fields;
  const DBN = DB_CONST.USER_QUESTIONS.name;
  
  let fieldsArr = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar,
    DBF.USERID_uuid,
    DBF.USERVID_varchar
  ];
  
  let condFieldsArr = null;
  let condValuesArr = null;
  
  let limit = null;
  let paramsArr = [];
  
  if(IDArr) {
    
    condFieldsArr = [DBF.ID_uuid_p];
    condValuesArr = [IDArr.length];
    
    let IDLen = IDArr.length;
    for(let i = 0; i < IDLen; i++) {
      paramsArr.push(IDArr[i]);
    }
    
  } else {
    limit = 100;
  }
    
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN,
                                      condFieldsArr, condValuesArr, null, null, null, limit);
  
  dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    
    if(result.rows.length == 0) {
      return callback(null, null);
    }
    
    let questionsArr = [];
    
    let rowsLen = result.rows.length;
    for (let i = 0; i < rowsLen; i++) {
      let rowObj = result.rows[i];
      
      let questionArr = {
        [PF.ID]      : rowObj[DBF.ID_uuid_p].toString(),
        [PF.TEXT]    : rowObj[DBF.TEXT_varchar],
        [PF.IMAGE_1] : rowObj[DBF.IMAGE1_varchar],
        [PF.IMAGE_2] : rowObj[DBF.IMAGE2_varchar],
        [PF.IMAGE_3] : rowObj[DBF.IMAGE3_varchar],
        [PF.FID]     : rowObj[DBF.USERID_uuid].toString(),
        [PF.FVID]    : rowObj[DBF.USERVID_varchar]
      };
      
      questionsArr.push(questionArr);
    }
    
    callback(null, questionsArr);
  });
};
