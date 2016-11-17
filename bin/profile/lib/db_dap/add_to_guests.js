var db = require('./../../../db_manager');

/*
 Добавляем гостя в БД
 */
module.exports = function(guestProfile, date, callback) {
 var self = this;
  
 var options = {
   guestid  : guestProfile.getID(),
   guestvid : guestProfile.getVID(),
   date     : date
 };
  
 db.addGuest(self.pID, options, function(err, guest) {
   if (err) { return callback(err, null); }

   self.pNewGuests ++;
   self.save(function(err) {
     if (err) { return callback(err, null); }

     callback(null, guest);
   });
 })
};