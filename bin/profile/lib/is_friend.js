/*
 Проверяем, является ли пользватель другом
 */

var constants = require('./../../io/constants');

module.exports = function(uid, callback) {
  var self = this;
  self.dbManager.findFriends(self.pID, uid, function(err, friend) {
    if (err) { return callback(err, null); }

    var result = {};
    result[constants.FIELDS.is_friend] = false;

    if(friend) {
      result[constants.FIELDS.is_friend] = true;
    }

    callback(null, result);
  });
};