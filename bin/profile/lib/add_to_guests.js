/*
 Добавляем гостя в БД
 */
module.exports = function(options, callback) {
 var self = this;
 self.dbManager.addGuest(self.pID, options, function(err, guest) {
   if (err) { return callback(err, null); }

   self.pNewGuests ++;
   self.save(function(err) {
     if (err) { return callback(err, null); }

     callback(null, guest);
   });
 })
};