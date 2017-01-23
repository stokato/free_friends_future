
const async = require('async');
const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

/*
 Удалить все подарки игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех подарков игрока (нужны их ИД для удаления)
 - Удаляем подарки отобранных игроков
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  
  const DBF = DB_CONST.USER_GIFTS.fields;
  const DBN = DB_CONST.USER_GIFTS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"));
  }
  
  async.waterfall([
    // Отбираем все подарки
    function (cb) {
      
      let fieldsArr = [DBF.ID_uuid_p, DBF.USERID_uuid_i];
      let condFieldsArr = [DBF.USERID_uuid_i];
      let condValuesArr = [1];
      let paramsArr     = [uid];
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
      dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err, result) => {
        if (err) {
          return cb(err, null);
        }
    
        cb(null, result);
      });
    },
    // Удаляем их
    function (result, cb) {
    
      let paramsArr = [];
      let constFields = [DBF.ID_uuid_p];
      let constValues = [result.rows.length];
  
      let rowsLen = result.rows.length;
      for (let i = 0; i < rowsLen; i ++) {
        paramsArr.push(result.rows[i][DBF.ID_uuid_p]);
      }
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, constFields, constValues);
      
      dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
        if (err) {
          return cb(err);
        }
  
        cb(null, uid);
      });
    }
  ], function (err, uid) {
    if (err) {
      return callback(err, null);
    }
  
    callback(null, uid);
  });

};