const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Найти все вопосы для игры questions
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */

module.exports = function(callback) {
  
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
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN);

  dbCtrlr.client.execute(query, [], { prepare: true }, (err, result) => {
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
    
    callback(null, questionsArr );
  });
};