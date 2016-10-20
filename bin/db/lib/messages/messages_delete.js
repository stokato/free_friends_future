var constants = require('../../../constants');
var cdb = require('./../common/cassandra_db');

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
  var fields = ["companionid"];
  var constFields =["userid"];
  var constValues = [1];

  //var query = "select companionid FROM user_chats where userid = ?";
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERCHATS, constFields, constValues);

  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var params = [];

    for (var i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i]);
    }

    // Удаляем сообщения
    var constFields = ["userid", "companionid"];
    var constValues = [1, result.rows.length];

    //var query = "DELETE FROM user_messages WHERE userid = ? and companionid in ( " + fields + " )";
    query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_USERMESSAGES, constFields, constValues);

    cdb.client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      // Удаляем чат
      //query = "DELETE FROM user_chats WHERE userid = ?";
      var constFields = ["userid"];
      var constValues = [1];

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_USERCHATS, constFields, constValues);

      cdb.client.execute(query, [uid], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, uid);
      });
    });
  });

};