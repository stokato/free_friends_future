var db = require('./../../db_manager');
/*
 Добавляем друга в БД
 */
module.exports = function(friendid, callback) {
 var self = this;
 db.addFriend(self.pID, friendid, function (err) {
   if (err) { return callback(err, null); }

   self.pNewFriends ++;
   self.save(function(err) {
     if (err) { return callback(err, null); }

     callback(null, friendid);
   });
 });
};