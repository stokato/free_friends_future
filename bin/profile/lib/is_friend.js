/*
 Проверяем, является ли пользватель другом
 */

var constants = require('./../../constants');

module.exports = function(usersID, callback) {
  var self = this;
  self.dbManager.findFriends(self.pID, usersID, function(err, friends) {
    if (err) { return callback(err, null); }

    //var result = {};
    //result["friend"] = false;
    //
    //if(friends) {
    //  result["friend"] = true;
    //}

    var results = [];
    for(var i = 0; i < usersID.length; i++) {
      results.push({id : usersID[i], isFriend : false });
      if(friends) {
        for(var j = 0; j < friends.length; j++) {
          if(friends[j].id == results[i].id) {
            results[i].isFriend = true;
          }
        }
      }
    }

    callback(null, results);
  });
};