var db = require('./../../../db_manager');

/*
 Добавляем друга в БД
 */
module.exports = function(friendProfile, date, callback) {
 var self = this;
  
  var params = {
    friendid  : friendProfile.getID(),
    friendvid : friendProfile.getVID(),
    date      : date
  };
  
  
 db.addFriend(self.pID, params, function (err) {
   if (err) { return callback(err, null); }

   self.pNewFriends ++;
   self.save(function(err) {
     if (err) { return callback(err, null); }

     callback(null, friendid);
   });
 });
};