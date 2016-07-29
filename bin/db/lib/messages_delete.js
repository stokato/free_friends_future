var C = require('../constants');
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
  //var f = C.IO.FIELDS;

  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  //var query = "select companionid FROM user_chats where userid = ?";
  var query = qBuilder.build(qBuilder.Q_SELECT, ["companionid"], C.T_USERCHATS, ["userid"], [1]);

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var params = [];

    var i, rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i ++) {
      params.push(result.rows[i]);
    }

    //var query = "DELETE FROM user_messages WHERE userid = ? and companionid in ( " + fields + " )";
    query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERMESSAGES,
                                             ["userid", "companionid"], [1, rowsLen]);
    self.client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      //query = "DELETE FROM user_chats WHERE userid = ?";
      var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERCHATS, ["userid"], [1]);
      self.client.execute(query, [uid], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, uid);
      });
    });
  });

};