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

  var query = "select companionid FROM user_chats where userid = ?";

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var fields = '';
    var params = [];
    for (var i = 0; i < result.rows.length-1; i ++) {
      fields += '?, ';
      params.push(result.rows[i]);
    }
    fields += '?';
    params.push(result.rows.length-1);

    var query = "DELETE FROM user_messages WHERE userid = ? and companionid in ( " + fields + " )";
    self.client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      query = "DELETE FROM user_chats WHERE userid = ?";
      self.client.execute(query, [uid], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, uid);
      });
    });
  });

};