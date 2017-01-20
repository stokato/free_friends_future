/**
 * Сохраняем личное сообщение в БД
 */

const  dbCtrlr = require('./../../db_manager');
const  PF      = require('./../../const_fields');

module.exports = function(companion, incoming, date, text, callback) {
  let  self = this;
  
  let  options = {
    [PF.DATE]      : date,
    [PF.FID]       : companion.getID(),
    [PF.VID]       : self.getVID(),
    [PF.INCOMING]  : incoming,
    [PF.TEXT]      : text,
    [PF.OPENED]    : self.isPrivateChat(companion.getID()), // Если чат открыт, сообщение уже прочитано
    [PF.SEX]       : self.getSex(),
    [PF.BDATE]     : self.getBDate(),
    [PF.FSEX]      : companion.getSex(),
    [PF.FBDATE]    : companion.getBDate(),
    [PF.FVID]      : companion.getVID()
  };
  
  dbCtrlr.addMessage(self._pID, options, (err) => {
    if (err) {
      return callback(err, null);
    }
    
    callback(null, options);
  });
};