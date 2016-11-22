var db = require('./../../../db_manager');

/*
 Сохраняем личное сообщение в БД
 */
module.exports = function(companion, incoming, date, text, callback) {
  var self = this;
  
  var message = {};
  message[db.CONST.DATE]            = date;
  message[db.CONST.ID]  = companion.getID();
  message[db.CONST.VID] = companion.getVID();
  message[db.CONST.INCOMING]     = incoming;
  message[db.CONST.TEXT]         = text;
  message[db.CONST.OPENED]       = self.isPrivateChat(companion.getID()); // Если чат открыт, сообщение уже прочитано

  db.addMessage(self._pID, message, function(err) {
    if (err) { return callback(err, null); }

    if (!self.isPrivateChat(companion.getID())) {
      self._pIsNewMessages ++;
      
      self.save(function(err) {
        if (err) { return callback(err, null); }

        callback(null, message);
      });
    } else callback(null, message);
  });
};