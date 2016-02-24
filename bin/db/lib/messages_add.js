var async = require('async');
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

  async.waterfall([
    function(cb) {
      var id = self.timeUuid.fromDate(date);

      var fields = "id, userid, date, companionid, companionvid, incoming, text";
      var values = "?, ?, ?, ?, ?, ?, ?";
      var params = [id, uid, date, companionid, companionvid, incoming, text];

      var query = "INSERT INTO user_messages (" + fields + ") VALUES (" + values + ")";

      self.client.execute(query, params, {prepare: true },  function(err) {
        if (err) { return cb(err); }

        cb(null, id);
      });
    }, function(id, cb) {
      var params = [uid, companionid];
      var query = "INSERT INTO user_chats ( userid, companionid) VALUES (?, ?)";

      self.client.execute(query, params, {prepare: true },  function(err) {
        if (err) { return cb(err); }

        cb(null, id);
      });
    },
    function(id, cb) {
      if(!opened) {
        var params = [uid, companionid, id];
        var query = "INSERT INTO user_new_messages ( userid, companionid, messageid) VALUES (?, ?, ?)";

        self.client.execute(query, params, {prepare: true },  function(err) {
          if (err) {  return cb(err); }

          cb(null, message);
        });
      } else cb(null, message);
    }
  ], function(err, message) {
    if (err) {  return callback(err); }

    callback(null, message);
  });
};