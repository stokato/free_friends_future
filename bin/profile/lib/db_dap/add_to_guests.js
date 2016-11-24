var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
    Добавляем гостя в БД
 */
module.exports = function(guestProfile, date, callback) {
 var self = this;
  
 var options = {};
 options[IOF.ID]    = guestProfile.getID();
 options[IOF.VID]   = guestProfile.getVID();
 options[IOF.SEX]   = guestProfile.getSex();
 options[IOF.BDATE] = guestProfile.getBDay();
 options[IOF.DATE]  = date;
  
 db.addGuest(self._pID, options, function(err, guest) {
   if (err) { return callback(err, null); }

     callback(null, guest);
 })
};