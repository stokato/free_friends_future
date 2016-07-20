/*
 Удаляем друга из БД
 */
module.exports = function(friend, callback) {
  var self = this;
  self.dbManager.deleteFriends(self.pID, friend, function (err) {
    if (err) { return callback(err, null); }

    callback(null, friend);
  });
};