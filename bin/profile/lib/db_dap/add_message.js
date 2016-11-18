var db = require('./../../../db_manager');

/*
 Сохраняем личное сообщение в БД
 */
module.exports = function(companion, incoming, date, text, callback) {
  var self = this;
  
  var message = {};
  message[db.CONST.DATE]            = date;
  message[db.CONST.MS_COMPANIONID]  = companion.getID();
  message[db.CONST.MS_COMPANIONVID] = companion.getVID();
  message[db.CONST.MS_INCOMING]     = incoming;
  message[db.CONST.MS_TEXT]         = text;
  message[db.CONST.MS_OPENED]       = self.isPrivateChat(companion.getID()); // Если чат открыт, сообщение уже прочитано

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