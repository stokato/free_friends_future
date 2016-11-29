var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
 Сохраняем личное сообщение в БД
 */
module.exports = function(companion, incoming, date, text, callback) {
  var self = this;
  
  var message = {};
  message[IOF.DATE]        = date;
  message[IOF.FID]         = companion.getID();
  message[IOF.VID]         = self.getVID();
  message[IOF.INCOMING]    = incoming;
  message[IOF.TEXT]        = text;
  message[IOF.OPENED]      = self.isPrivateChat(companion.getID()); // Если чат открыт, сообщение уже прочитано
  message[IOF.SEX]         = self.getSex();
  message[IOF.BDATE]       = self.getBDate();
  message[IOF.FSEX]        = companion.getSex();
  message[IOF.FBDATE]      = companion.getBDate();
  message[IOF.FVID]        = companion.getVID();
  
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