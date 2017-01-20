/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Удаляем вопросы по списку ид из таблицы вопросов пользователей
 *
 */

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

module.exports = function(IDArr, callback) {
  
  const DBF = DB_CONST.USER_QUESTIONS.fields;
  const DBN = DB_CONST.USER_QUESTIONS.name;

  if (!IDArr) {
    return callback(new Error("Не заданы ид вопросов"));
  }
  
  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [IDArr.length];
  let paramsArr     = [];
  
  let IDLen = IDArr.length;
  for(let i = 0; i < IDLen; i++) {
    paramsArr.push(IDArr[i]);
  }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);
  
  dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, null);
  });
};