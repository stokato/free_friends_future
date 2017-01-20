const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Изменяем данные вопроса
 */
module.exports = function(options, callback) { options = options || {};
  
  const DBF = DB_CONST.QUESTIONS.fields;
  const DBN = DB_CONST.QUESTIONS.name;
  
  if (!options[PF.ID]) {
    return callback(new Error("Задан пустй Id вопроса"), null);
  }
  
  let fieldsArr = [];
  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [1];
  
  
  let paramsArr = [];
  if (PF.TEXT in options)      { fieldsArr.push(DBF.TEXT_varchar);     paramsArr.push(options[PF.TEXT]); }
  if (PF.IMAGE_1 in options)   { fieldsArr.push(DBF.IMAGE1_varchar);   paramsArr.push(options[PF.IMAGE_1]); }
  if (PF.IMAGE_2 in options)   { fieldsArr.push(DBF.IMAGE2_varchar);   paramsArr.push(options[PF.IMAGE_2]); }
  if (PF.IMAGE_3 in options)   { fieldsArr.push(DBF.IMAGE3_varchar);   paramsArr.push(options[PF.IMAGE_3]); }
  if (PF.ACTIVITY in options)  { fieldsArr.push(DBF.ACTIVITY_boolean); paramsArr.push(!!options[PF.ACTIVITY]); }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_UPDATE, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
  paramsArr.push(options[PF.ID]);
  
  dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, options);
  });
};