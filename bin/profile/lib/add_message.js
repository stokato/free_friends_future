/**
 * Сохраняем личное сообщение в БД
 */

const  db = require('./../../db_manager');
const  IOF = require('./../../constants').PFIELDS;

module.exports = function(companion, incoming, date, text, callback) {
  let  self = this;
  
  let  message = {
    [IOF.DATE]      : date,
    [IOF.FID]       : companion.getID(),
    [IOF.VID]       : self.getVID(),
    [IOF.INCOMING]  : incoming,
    [IOF.TEXT]      : text,
    [IOF.OPENED]    : self.isPrivateChat(companion.getID()), // Если чат открыт, сообщение уже прочитано
    [IOF.SEX]       : self.getSex(),
    [IOF.BDATE]     : self.getBDate(),
    [IOF.FSEX]      : companion.getSex(),
    [IOF.FBDATE]    : companion.getBDate(),
    [IOF.FVID]      : companion.getVID()
  };
  
  db.addMessage(self._pID, message, function(err) {
    if (err) { return callback(err, null); }
    
    callback(null, message);
  });
};