var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Удалить все сообщения игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех сообщений игрока (нужны их ИД для удаления)
 - По каждому найденному выполняем запрос на его удаления (параллельно)
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  var self = this;

  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  // Отбираем сообщения
  var fields = ["companionid"];
  var constFields =["userid"];
  var constValues = [1];

  //var query = "select companionid FROM user_chats where userid = ?";
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERCHATS, constFields, constValues);

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var params = [];

    for (var i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i]);
    }

    // Удаляем сообщения
    var constFields = ["userid", "companionid"];
    var constValues = [1, result.rows.length];

    //var query = "DELETE FROM user_messages WHERE userid = ? and companionid in ( " + fields + " )";
    query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERMESSAGES, constFields, constValues);

    self.client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      // Удаляем чат
      //query = "DELETE FROM user_chats WHERE userid = ?";
      var constFields = ["userid"];
      var constValues = [1];

      var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERCHATS, constFields, constValues);

      self.client.execute(query, [uid], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, uid);
      });
    });
  });

};