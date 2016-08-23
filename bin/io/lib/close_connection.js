var async     =  require('async');

var GameError = require('../../game_error'),      // Ошбики
    //checkInput = require('../../check_input'),    // Верификация
    constants = require('./../../constants'),     // Константы
    getRoomInfo = require('./get_room_info'),
    defineSex = require('./define_sex'),
    sendUsersInRoom = require('./send_users_in_room');

var oPool = require('./../../objects_pool');

module.exports = function(socket) {
  //if (!checkInput(constants.IO_DISCONNECT, socket, oPool.userList, {})) { return; }

  var selfProfile = oPool.userList[socket.id];

  async.waterfall([
    ///////////////////////////////////////////////////////////////////////////////////
    function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
      var info = {
        id  : selfProfile.getID(),
        vid : selfProfile.getVID()
      };

      //if(selfProfile.getReady()) { // Останавливаем игру
      //  oPool.roomList[socket.id].game.stop();
      //}

      //socket.broadcast.emit(constants.IO_OFFLINE, info);

      for(var r in oPool.rooms) if(oPool.rooms.hasOwnProperty(r)) {
        socket.broadcast.in(r.name).emit(constants.IO_OFFLINE, info);
      }

      cb(null, null);
    }, ///////////////////////////////////////////////////////////////////////////////////////
    function (res, cb) { // сохраняем профиль в базу

      selfProfile.save(function (err) {
        if (err) {  return cb(err, null);  }

        cb(null, null);
      });

    }, /////////////////////////////////////////////////////////////////////////////////////
    function (res, cb) { // удалеяем профиль и сокет из памяти
      delete oPool.userList[socket.id];

      var sex = defineSex(selfProfile);

      var room = oPool.roomList[socket.id];

      if (room) {
        var roomName = oPool.roomList[socket.id].name;
        delete oPool.roomList[socket.id][sex.sexArr][selfProfile.getID()];
        oPool.roomList[socket.id][sex.len]--;
        delete oPool.roomList[socket.id];
        delete oPool.profiles[selfProfile.getID()];
        if (oPool.rooms[roomName].guys_count == 0 && oPool.rooms[roomName].girls_count == 0) {
          delete oPool.rooms[roomName];
          room = null;
        }
      }
      cb(null, room);
    },///////////////////////////////////////////////////////////////
    function (room, cb) { // Получаем данные по игрокам в комнате (для стола)
      if(room) {
        getRoomInfo(room, function (err, roomInfo) {
          if (err) { return cb(err, null); }

          //socket.broadcast.in(room.name).emit(constants.IO_ROOM_USERS, roomInfo);
          sendUsersInRoom(roomInfo, selfProfile.getID(), function(err, roomInfo) {
            if(err) { return cb(err); }

            cb(null, null);
          });
        });
      } else {
        cb(null, null);
      }
    }//////////////////////////////////////////////////////////////////////////////////////
  ], function (err) {
    if (err) { new GameError(null, constants.IO_DISCONNECT, err.message)  }

    //callback(null, null);
    socket.disconnect(); // отключаемся
  }); ///////////////////////////////////////////////////////////////////////////////////////
};
