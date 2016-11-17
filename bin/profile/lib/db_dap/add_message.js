var db = require('./../../../db_manager');

/*
 Сохраняем личное сообщение в БД
 - Сообщение должно иметь поля: собеседник, входящее/bool, текст, дата
 */
module.exports = function(companion, incoming, date, text, callback) {
  var self = this;
  
  var message = {
    date          : date,
    companionid   : companion.getID(),
    companionvid  : companion.getVID(),
    incoming      : incoming,
    text          : text,
    opened        : self.isPrivateChat(companion.getID()) // Если чат открыт, сообщение уже прочитано
  };

  db.addMessage(self.pID, message, function(err) {
    if (err) { return callback(err, null); }

    if (!self.isPrivateChat(companion.getID())) {
      self.pNewMessages ++;
      self.save(function(err) {
        if (err) { return callback(err, null); }

        callback(null, message);
      });
    } else callback(null, message);
  });
};