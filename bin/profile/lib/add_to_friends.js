/**
 * Добавляем друга пользователю, сохраняем в БД
 */

const  db  = require('./../../db_manager');
const  IOF = require('./../../const_fields');

module.exports = function(friendProfile, date, callback) {
  let  self = this;
  
  let  params = {
    [IOF.ID]     : friendProfile.getID(),
    [IOF.VID]    : friendProfile.getVID(),
    [IOF.SEX]    : friendProfile.getSex(),
    [IOF.BDATE]  : friendProfile.getBDate(),
    [IOF.DATE]   : date
  };
  
  db.addFriend(self._pID, params, function (err) {
    if (err) { return callback(err, null); }
    
    callback(null, friendProfile.getID());
  });
};