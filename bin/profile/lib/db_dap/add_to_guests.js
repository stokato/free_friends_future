var db = require('./../../../db_manager');

/*
    Добавляем гостя в БД
 */
module.exports = function(guestProfile, date, callback) {
 var self = this;
  
 var options = {};
 options[db.CONST.GU_GUESTID]   = guestProfile.getID();
 options[db.CONST.GU_GUESTVID]  = guestProfile.getVID();
 options[db.CONST.DATE]         = date;
  
 db.addGuest(self._pID, options, function(err, guest) {
   if (err) { return callback(err, null); }

   self._pIsNewGuests ++;
   self.save(function(err) {
     if (err) { return callback(err, null); }

     callback(null, guest);
   });
 })
};