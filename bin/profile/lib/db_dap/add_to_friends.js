var db = require('./../../../db_manager');

/*
    Добавляем друга в БД
 */
module.exports = function(friendProfile, date, callback) {
 var self = this;
  
  var params = {};
  params[db.CONST.ID]  = friendProfile.getID();
  params[db.CONST.VID] = friendProfile.getVID();
  params[db.CONST.DATE]         = date;
  
 db.addFriend(self._pID, params, function (err) {
   if (err) { return callback(err, null); }

   // self._pIsNewFriends ++;
   // self.save(function(err) {
   //   if (err) { return callback(err, null); }

     callback(null, friendProfile.getID());
   // });
 });
};