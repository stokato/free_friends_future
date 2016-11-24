var db = require('./../../../db_manager');

/*
    Добавляем гостя в БД
 */
module.exports = function(guestProfile, date, callback) {
 var self = this;
  
 var options = {};
 options[db.CONST.ID]   = guestProfile.getID();
 options[db.CONST.VID]  = guestProfile.getVID();
 options[db.CONST.SEX]  = guestProfile.getSex();
 options[db.CONST.BDATE] = guestProfile.getBDay();
 options[db.CONST.DATE]         = date;
  
 db.addGuest(self._pID, options, function(err, guest) {
   if (err) { return callback(err, null); }

     callback(null, guest);
 })
};