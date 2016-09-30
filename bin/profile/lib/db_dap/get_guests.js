var db = require('./../../../db_manager');

/*
 Получаем гостей из БД
 */
module.exports = function(isSelf, callback) {
 var self = this;
 db.findGuests(self.pID, function(err, guests) {
   if (err) { return callback(err, null); }

   if(isSelf) {
     self.pNewGuests = 0;
   }

   self.save(function(err) {
     if (err) { return callback(err, null); }

     callback(null, guests);
   });
 });
};