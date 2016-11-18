var db = require('./../../../db_manager');

/*
    Удаляем друга из БД
 */
module.exports = function(friend, callback) {
  var self = this;
  db.deleteFriends(self._pID, friend, function (err) {
    if (err) { return callback(err, null); }

    callback(null, friend);
  });
};