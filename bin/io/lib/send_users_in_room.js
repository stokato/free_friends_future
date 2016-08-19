// Отправляем пользователям информацию о комнате, в которой они находятся
var async = require('async');

var constants = require('./../../constants');
var oPool = require('./../../objects_pool');


module.exports = function(info, selfId, callback) {

  var usersID = [], i;

  for(i = 0; i < info.guys.length; i++) {
    usersID.push(info.guys[i].id);
  }

  for(i = 0; i < info.girls.length; i++) {
    usersID.push(info.girls[i].id);
  }

  async.map(usersID, function(id, cb) {
    var profile = oPool.profiles[id];
    var roomUsers = usersID.slice();
    var pos = usersID.indexOf(id);
    roomUsers.splice(pos, 1);

    if(roomUsers.length > 0) {
      profile.isFriend(roomUsers, function(err, friends) {
        if(err) { return cb(err); }

        var newInfo = JSON.parse(JSON.stringify(info));

        for(var i = 0; i < friends.length; i++) {
          var j;
          for(j = 0; j < newInfo.guys.length; j++) {
            if(friends[i].id == newInfo.guys[j].id) {
              newInfo.guys[j].is_friend = true;
            }
          }

          for(j = 0; j < newInfo.girls.length; j++) {
            if(friends[i].id == newInfo.girls[j].id) {
              newInfo.girls[j].is_friend = true;
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

