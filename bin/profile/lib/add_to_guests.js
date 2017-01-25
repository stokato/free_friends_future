/**
 * Добавляем гостя пользователю, сохраняем в БД
 */

const dbCtrlr = require('./../../db_controller');
const PF      = require('./../../const_fields');

module.exports = function(guestProfile, date, callback) {
  let  self = this;
  
  let  options = {
    [PF.ID]    : guestProfile.getID(),
    [PF.VID]   : guestProfile.getVID(),
    [PF.SEX]   : guestProfile.getSex(),
    [PF.BDATE] : guestProfile.getBDate(),
    [PF.DATE]  : date
  };
  
  dbCtrlr.addGuest(self._pID, options, (err, guest) => {
    if (err) {
      return callback(err, null);
    }
    
    callback(null, guest);
  })
};