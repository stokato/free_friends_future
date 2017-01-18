const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.QUESTIONS.fields;
const PF  = constants.PFIELDS;

/*
 Найти все вопосы для игры questions
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(activity, callback) { activity = activity || false;

  let fields = [DBF.ID_uuid_p, DBF.TEXT_varchar, DBF.IMAGE1_varchar, DBF.IMAGE2_varchar, DBF.IMAGE3_varchar, DBF.ACTIVITY_boolean];
  let constFields = [DBF.ACTIVITY_boolean];
  let constValues = [1];
  let dbName = dbConst.QUESTIONS.name;
  let params = [activity];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);

  cdb.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, null);

    let questions = [], question, row;

    for (let i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      question = {
        [PF.ID]       : row[DBF.ID_uuid_p].toString(),
        [PF.TEXT]     : row[DBF.TEXT_varchar],
        [PF.IMAGE_1]  : row[DBF.IMAGE1_varchar],
        [PF.IMAGE_2]  : row[DBF.IMAGE2_varchar],
        [PF.IMAGE_3]  : row[DBF.IMAGE3_varchar],
        [PF.ACTIVITY] : row[DBF.ACTIVITY_boolean]
      };
      
      questions.push(question);
    }
    
    callback(null, questions );
  });
};