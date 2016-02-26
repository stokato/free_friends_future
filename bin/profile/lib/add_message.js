/*
 Сохраняем личное сообщение в БД
 - Сообщение должно иметь поля: собеседник, входящее/bool, текст, дата
 */
module.exports = function(message, callback) {
  var self = this;

  message.opened = self.isPrivateChat(message.companionid); // Если чат открыт, сообщение уже прочитано

  self.dbManager.addMessage(self.pID, message, function(err) {
    if (err) { return callback(err, null); }

    if (!self.isPrivateChat(message.companionid)) {
      self.pNewMessages ++;
      self.save(function(err) {
        if (err) { return callback(err, null); }

        callback(null, null);
      });
    } else callback(null, null);
  });
};