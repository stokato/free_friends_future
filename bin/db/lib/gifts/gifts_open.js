/**
 * Created by s.t.o.k.a.t.o on 18.11.2016.
 */
const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

/*
 Снимаем поментку Новый со всех подарков пользователя
 */
module.exports = function(uid, callback) {
  
  const DBF = DB_CONST.USER_GIFTS.fields;
  const DBN = DB_CONST.USER_NEW_GIFTS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"));
  }
  
  let fieldsArr     = [DBF.ID_uuid_p];
  let condFieldsArr = [DBF.USERID_uuid_i];
  let condValuesArr = [1];
  
  // Отбираем все новые подарки пользователя
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
  dbCtrlr.client.execute(query,[uid], {prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    
    // Меняем флаг нового сообщения
    let paramsArr = [];
    let condFieldsArr = [DBF.ID_uuid_p];
    let condValuesArr = [result.rows.length];
    
    let rowsLen = result.rows.length;
    for (let i = 0; i < rowsLen; i ++) {
      paramsArr.push(result.rows[i][DBF.ID_uuid_p].toString());
    }
    
    let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);
    dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, uid);
    });
  });
};