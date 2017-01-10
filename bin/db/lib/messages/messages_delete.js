const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF  = dbConst.USER_MESSAGES.fields;
const DBFN = dbConst.USER_NEW_MESSAGES.fields;
const DBFC = dbConst.USER_CHATS.fields;

/*
 Удалить все сообщения игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех сообщений игрока (нужны их ИД для удаления)
 - Удаляем найденные сообещения
 - Удаляем чат
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  // Отбираем сообщения
  let fields = [DBFC.COMPANIONID_uuid_c];
  let constFields =[DBFC.USERID_uuid_p];
  let constValues = [1];
  let dbName = dbConst.USER_CHATS.name;

  //let query = "select companionid FROM user_chats where userid = ?";
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);

  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    let params = [];

    for (let i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i][DBFN.COMPANIONID_uuid_pc2i]);
    }

    // Удаляем сообщения
    let constFields = [
      DBF.USERID_uuid_pci,
      DBF.COMPANIONID_uuid_pc2i
    ];
    
    let constValues = [
      1,
      result.rows.length
    ];
    
    let dbName = dbConst.USER_MESSAGES.name;

    //let query = "DELETE FROM user_messages WHERE userid = ? and companionid in ( " + fields + " )";
    query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);

    cdb.client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      // Удаляем чат
      //query = "DELETE FROM user_chats WHERE userid = ?";
      let constFields = [DBFC.USERID_uuid_p];
      let constValues = [1];
      let dbName = dbConst.USER_CHATS.name;

      let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);

      cdb.client.execute(query, [uid], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, uid);
      });
    });
  });

};