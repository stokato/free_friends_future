var db = require('./../../../db_manager');

/*
    Получаем всех друзей из БД
 */
module.exports = function(isSelf, callback) {
 var self = this;
  
 db.findFriends(self._pID, null, isSelf, function(err, friends) {
   if (err) { return callback(err, null); }
   
     callback(null, friends);
 });
};