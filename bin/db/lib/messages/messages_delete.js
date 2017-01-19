
const async    = require('async');
const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

/*
 Удалить все сообщения игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех сообщений игрока (нужны их ИД для удаления)
 - Удаляем найденные сообещения
 - Удаляем чат
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  
  const DBF  = DB_CONST.USER_MESSAGES.fields;
  const DBN = DB_CONST.USER_MESSAGES.name;

  const DBFC = DB_CONST.USER_CHATS.fields;
  const DBNC = DB_CONST.USER_CHATS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"));
  }

  //TODO: проверить работу
  
  async.waterfall([
    // Отбираем сообщения
    function (cb) {
    
      let fieldsArr     = [DBFC.COMPANIONID_uuid_c];
      let condFieldsArr = [DBFC.USERID_uuid_p];
      let condValuesArr = [1];
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBNC, condFieldsArr, condValuesArr);
  
      dbCtrlr.client.execute(query,[uid], {prepare: true }, (err, result) => {
        if (err) {
          return cb(err, null);
        }
    
        cb(null, result);
      });
    },
    // Удаляем сообщения
    function (result, cb) {
  
      let paramsArr = [];
  
      let rowsLen = result.rows.length;
      for (let i = 0; i < rowsLen; i ++) {
        paramsArr.push(result.rows[i][DBFC.COMPANIONID_uuid_c]);
      }
      
      let condFieldsArr = [ DBF.USERID_uuid_pci, DBF.COMPANIONID_uuid_pc2i ];
      let condValuesArr = [ 1, result.rows.length ];
      
      query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);
  
      dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
        if (err) {
          return cb(err);
        }
    
        cb(null, result);
      });
    },
    function (result, cb) {
  
      // Удаляем чат
      let condFieldsArr = [DBFC.USERID_uuid_p];
      let condValuesArr = [1];
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBNC, condFieldsArr, condValuesArr);
  
      dbCtrlr.client.execute(query, [uid], {prepare: true }, (err) => {
        if (err) {
          return cb(err);
        }
  
        cb(null, uid);
      });
    }
  ], function (err, uid) {
    if (err) {
      return callback(err);
    }
  
    callback(null, uid);
  });
  

};