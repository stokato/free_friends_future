/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Получить список вопросов из базы данных
 *
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');


module.exports = function(IDArr, callback) { IDArr = IDArr || [];
  
  const DBF = DB_CONST.QUESTIONS.fields;
  const DBN = DB_CONST.QUESTIONS.name;
  
  let fieldsArr = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar,
    DBF.ACTIVITY_boolean
  ];
  
  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [IDArr.length];
  let paramsArr = [];
  
  let IDLen = IDArr.length;
  for(let i = 0; i < IDLen; i++) {
    paramsArr.push(IDArr[i]);
  }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
  dbCtrlr.client.execute(query,[], { prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    
    if(result.rows.length == 0) {
      return callback(null, null);
    }
    
    let questionsArr = [];
    
    for (let i = 0; i < result.rows.length; i++) {
      let rowObj = result.rows[i];
      
      let questionObj = {
        [PF.ID]       : rowObj[DBF.ID_uuid_p].toString(),
        [PF.TEXT]     : rowObj[DBF.TEXT_varchar],
        [PF.IMAGE_1]  : rowObj[DBF.IMAGE1_varchar],
        [PF.IMAGE_2]  : rowObj[DBF.IMAGE2_varchar],
        [PF.IMAGE_3]  : rowObj[DBF.IMAGE3_varchar],
        [PF.ACTIVITY] : rowObj[DBF.ACTIVITY_boolean]
      };
      
      questionsArr.push(questionObj);
    }
    
    callback(null, questionsArr);
  });
};

