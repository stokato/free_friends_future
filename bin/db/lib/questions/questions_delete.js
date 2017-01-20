const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

/*
 Удаляем вопрос из бд
 */
module.exports = function(idList, callback) {
  
  const DBF = DB_CONST.QUESTIONS.fields;
  const DBN = DB_CONST.QUESTIONS.name;
  
  if (!idList) {
    return callback(new Error("Не заданы ид вопросов"));
  }
  
  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [idList.length];
  let paramsArr = [];
  
  
  for(let i = 0; i < idList.length; i++) {
    paramsArr.push(idList[i]);
  }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);
  
  dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, null);
  });
};