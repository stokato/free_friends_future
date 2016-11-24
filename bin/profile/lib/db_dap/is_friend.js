var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
    Проверяем, является ли пользватель другом
 */

module.exports = function(usersID, callback) {
  var self = this;
  
  db.findFriends(self._pID, usersID, false, function(err, friendsInfo) { friendsInfo = friendsInfo || {};
    if (err) { return callback(err, null); }

    var results = [];
    for(var i = 0; i < usersID.length; i++) {
      
      var info = {};
      info[IOF.ID] = usersID[i];
      info[IOF.ISFRIEND] = false;
      
      results.push(info);
      
      if(friendsInfo.friends) {
        var friends = friendsInfo.friends;
        
        for(var j = 0; j < friends.length; j++) {
          if(friends[j][IOF.ID] == results[i][IOF.ID]) {
            results[i][IOF.ISFRIEND] = true;
          }
        }
        
      }
      
    }

    callback(null, results);
  });
};