var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_MESSAGES.fields;
var DBFN = dbConst.DB.USER_NEW_MESSAGES.fields;
var DBFC = dbConst.DB.USER_CHATS.fields;

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
  var fields = [DBFC.COMPANIONID_uuid_c];
  var constFields =[DBFC.USERID_uuid_p];
  var constValues = [1];
  var dbName = dbConst.DB.USER_CHATS.name;

  //var query = "select companionid FROM user_chats where userid = ?";
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);

  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var params = [];

    for (var i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i][DBFN.COMPANIONID_uuid_pc2i]);
    }

    // Удаляем сообщения
    var constFields = [
      DBF.USERID_uuid_pci,
      DBF.COMPANIONID_uuid_pc2i
    ];
    
    var constValues = [
      1,
      result.rows.length
    ];
    
    var dbName = dbConst.DB.USER_MESSAGES.name;

    //var query = "DELETE FROM user_messages WHERE userid = ? and companionid in ( " + fields + " )";
    query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);

    cdb.client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      // Удаляем чат
      //query = "DELETE FROM user_chats WHERE userid = ?";
      var constFields = [DBFC.USERID_uuid_p];
      var constValues = [1];
      var dbName = dbConst.DB.USER_CHATS.name;

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);

      cdb.client.execute(query, [uid], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, uid);
      });
    });
  });

};