

const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF = dbConst.USER_GIFTS.fields;

/*
 Удалить все подарки игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех подарков игрока (нужны их ИД для удаления)
 - Удаляем подарки отобранных игроков
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {

  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }
  
  // Отбираем все подарки
  let fields = [DBF.ID_uuid_p, DBF.USERID_uuid_i];
  let constFields = [DBF.USERID_uuid_i];
  let constValues = [1];
  let dbName = dbConst.USER_GIFTS.name;
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    // Удаляем их
    let params = [];
    let constFields = [DBF.ID_uuid_p];
    let constValues = [result.rows.length];
    
    for (let i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i][DBF.ID_uuid_p]);
    }
    
    let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
    cdb.client.execute(query, params, { prepare: true }, function(err) {
      if (err) {  return callback(err); }
      
      callback(null, uid);
    });
  });
};