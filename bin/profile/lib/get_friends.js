var db = require('./../../db_manager');

/*
 Получаем всех друзей из БД
 */
module.exports = function(isSelf, callback) {
 var self = this;
 db.findFriends(self.pID, null, function(err, friends) {
   if (err) { return callback(err, null); }

   if(isSelf) {
     self.pNewFriends = 0;
   }

   self.save(function(err) {
     if (err) { return callback(err, null); }

     callback(null, friends);
   });
 });
};