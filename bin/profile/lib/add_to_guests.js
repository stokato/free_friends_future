/**
 * Добавляем гостя пользователю, сохраняем в БД
 */

const db  = require('./../../db_manager');
const IOF = require('./../../constants').PFIELDS;

module.exports = function(guestProfile, date, callback) {
  let  self = this;
  
  let  options = {
    [IOF.ID]    : guestProfile.getID(),
    [IOF.VID]   : guestProfile.getVID(),
    [IOF.SEX]   : guestProfile.getSex(),
    [IOF.BDATE] : guestProfile.getBDate(),
    [IOF.DATE]  : date
  };
  
  db.addGuest(self._pID, options, function(err, guest) {
    if (err) { return callback(err, null); }
    
    callback(null, guest);
  })
};