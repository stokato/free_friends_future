// Отправляем пользователям информацию о комнате, в которой они находятся
var async = require('async');

var constants = require('./../../../constants'),
  PF          = constants.PFIELDS,
  oPool       = require('./../../../objects_pool');


module.exports = function(info, selfId, callback) {

  var usersID = [], i;

  for(i = 0; i < info.guys.length; i++) {
    usersID.push(info.guys[i][PF.ID]);
  }

  for(i = 0; i < info.girls.length; i++) {
    usersID.push(info.girls[i][PF.ID]);
  }

  async.map(usersID, function(id, cb) {
    var profile   = oPool.profiles[id];
    var roomUsers = usersID.slice();
    var pos       = usersID.indexOf(id);
    roomUsers.splice(pos, 1);

    if(roomUsers.length > 0) {
      profile.isFriend(roomUsers, function(err, friends) {
        if(err) { return cb(err); }

        var newInfo = JSON.parse(JSON.stringify(info));

        for(var i = 0; i < friends.length; i++) {
          var j;
          for(j = 0; j < newInfo.guys.length; j++) {
            if(friends[i][PF.ID] == newInfo.guys[j][PF.ID]) {
              newInfo.guys[j][PF.ISFRIEND] = friends[i][PF.ISFRIEND];
            }
          }

          for(j = 0; j < newInfo.girls.length; j++) {
            if(friends[i][PF.ID] == newInfo.girls[j][PF.ID]) {
              newInfo.girls[j][PF.ISFRIEND] = friends[i][PF.ISFRIEND];
            }
          }
        }

        var res = emitRoomInfo(profile, newInfo);

        cb(null, res);
      })
    } else {
      var res = emitRoomInfo(profile, info);
      cb(null, res);
    }
  }, function(err, results) {
    if(err) { callback(err); }

    var res = null;
    for(var i = 0; i < results.length; i++) {
      if(results[i]) {
        res = results[i];
      }
    }

    callback(null, res);
  });

  //-------------
  function emitRoomInfo(profile, info) {
    var res = null;
    if(selfId && profile.getID() == selfId) {
      res = info;
    }

    if(!res) {
      profile.getSocket().emit(constants.IO_ROOM_USERS, info);
    }

    return res;
  }
};

