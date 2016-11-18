var db = require('./../../../db_manager');

/*
    Проверяем, является ли пользватель другом
 */

module.exports = function(usersID, callback) {
  var self = this;
  
  db.findFriends(self._pID, usersID, function(err, friends) {
    if (err) { return callback(err, null); }

    var results = [];
    for(var i = 0; i < usersID.length; i++) {
      results.push({id : usersID[i], isFriend : false });
      
      if(friends) {
        
        for(var j = 0; j < friends.length; j++) {
          if(friends[j][db.CONST.ID] == results[i].id) {
            results[i].isFriend = true;
          }
        }
        
      }
      
    }

    callback(null, results);
  });
};