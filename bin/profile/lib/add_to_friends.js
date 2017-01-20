/**
 * Добавляем друга пользователю, сохраняем в БД
 */

const  dbCtrlr  = require('./../../db_manager');
const  PF       = require('./../../const_fields');

module.exports = function(friendProfile, date, callback) {
  let  self = this;
  
  let  params = {
    [PF.ID]     : friendProfile.getID(),
    [PF.VID]    : friendProfile.getVID(),
    [PF.SEX]    : friendProfile.getSex(),
    [PF.BDATE]  : friendProfile.getBDate(),
    [PF.DATE]   : date
  };
  
  dbCtrlr.addFriend(self._pID, params, (err) => {
    if (err) {
      return callback(err, null);
    }
    
    callback(null, friendProfile.getID());
  });
};