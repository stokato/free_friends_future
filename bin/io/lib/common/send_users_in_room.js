/**
 * Отправляем пользователям информацию о комнате, в которой они находятся
 *
 * @param info - сведения о комнате, selfID - ид пользователя, сведения о котором следует вернуть, callback
 * @return info
 */

const async = require('async');

const constants = require('./../../../constants');
const oPool       = require('./../../../objects_pool');

const PF          = constants.PFIELDS;

module.exports = function(info, selfId, callback) {

  // Сосовтавляем список ид всех пользователей в комнате
  // TODO: следуте изменить
  let  usersID = [], i;

  for(i = 0; i < info.guys.length; i++) {
    usersID.push(info.guys[i][PF.ID]);
  }

  for(i = 0; i < info.girls.length; i++) {
    usersID.push(info.girls[i][PF.ID]);
  }

  // Для каждого  пользователя проверяем - кто из остальных является его другом,
  // отправляем измененные сведения этому пользователю
  async.map(usersID, function(id, cb) {
    let  profile   = oPool.profiles[id];
    let  roomUsers = usersID.slice();
    let  pos       = usersID.indexOf(id);
    roomUsers.splice(pos, 1);

    if(roomUsers.length > 0) {
      profile.isFriend(roomUsers, function(err, friends) {
        if(err) { return cb(err); }

        let  newInfo = JSON.parse(JSON.stringify(info));

        for(let  i = 0; i < friends.length; i++) {
          let  j;
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

        let  res = emitRoomInfo(profile, newInfo);

        cb(null, res);
      })
    } else {
      let  res = emitRoomInfo(profile, info);
      cb(null, res);
    }
  }, function(err, results) { // Возвращаем измененные сведения укзаанному пользователю
    if(err) { callback(err); }

    let  res = null;
    for(let  i = 0; i < results.length; i++) {
      if(results[i]) {
        res = results[i];
      }
    }

    callback(null, res);
  });

  //-------------------------------------
  function emitRoomInfo(profile, info) {
    let  res = null;
    if(selfId && profile.getID() == selfId) {
      res = info;
    }

    if(!res) {
      profile.getSocket().emit(constants.IO_ROOM_USERS, info);
    }

    return res;
  }
};

