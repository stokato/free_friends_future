/*
 Добавить сообщение в БД: ИД, объект сообщения
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) {
  var self = this;
  var message = options || {};
  var companionid = message.companionid;
  var incoming  = message.incoming;
  var text      = message.text;
  var companionvid = message.companionvid;
  var date = message.date || new Date();
  var opened   = message.opened;

  if (!date || !uid || !companionid || !text || !companionvid) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  var id = this.timeUuid.fromDate(date);

  var fields = "id, userid, date, companionid, companionvid, incoming, text, opened";
  var values = "?, ?, ?, ?, ?, ?, ?, ?";
  var params = [id, uid, date, companionid, companionvid, incoming, text, opened];

  var query = "INSERT INTO user_messages (" + fields + ") VALUES (" + values + ")";

  self.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    query = "INSERT INTO user_chats ( userid, companionid ) VALUES ( ?, ? )";
    self.client.execute(query, [uid, companionid], {prepare: true },  function(err) {
      if (err) {  return callback(err); }

      callback(null, message);
    });
  });
};