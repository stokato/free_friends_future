var async     =  require('async');

var IOError         = require('./../common/io_error'),
    constants       = require('./../../../constants'),     // Константы
    PF              = constants.PFIELDS,
    emitAllRooms    = require('../common/emit_all_rooms'),
    sendUsersInRoom = require('./send_users_in_room');

var oPool = require('./../../../objects_pool');

module.exports = function(socket) {

  var selfProfile = oPool.userList[socket.id];

  async.waterfall([//----------------------------------------------------------------
    function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
      
      var info = {};
      info[PF.ID] = selfProfile.getID();
      info[PF.VID] = selfProfile.getVID();

      for(var r in oPool.rooms) if(oPool.rooms.hasOwnProperty(r)) {
        socket.broadcast.in(oPool.rooms[r].getName()).emit(constants.IO_OFFLINE, info);
      }

      cb(null, null);
    }, //----------------------------------------------------------------
    function (res, cb) { // сохраняем профиль в базу

      selfProfile.save(function (err) {
        if (err) {  return cb(err, null);  }

        cb(null, null);
      });

    }, //----------------------------------------------------------------
    function (res, cb) { // удалеяем профиль и сокет из памяти
      delete oPool.userList[socket.id];

      var sex = selfProfile.getSex();

      var room = oPool.roomList[socket.id];

      if (room) {
        
        room.deleteProfile(sex, selfProfile);
        
        delete oPool.roomList[socket.id];
        delete oPool.profiles[selfProfile.getID()];
        
        if (room.getCountInRoom(constants.GUY) == 0 && room.getCountInRoom(constants.GIRL) == 0) {
          delete oPool.rooms[room.getName()];
          room = null;
        }
      }
      cb(null, room);
    },//----------------------------------------------------------------
    function (room, cb) { // Получаем данные по игрокам в комнате (для стола)
      if(room) {
        
        var roomInfo = room.getInfo();
  
        sendUsersInRoom(roomInfo, selfProfile.getID(), function(err, roomInfo) {
          if(err) { return cb(err); }
    
          var params = {};
          params[PF.ID] = selfProfile.getID();
          params[PF.VID] = selfProfile.getVID();
          
          emitAllRooms(socket, constants.IO_OFFLINE, params);
    
          cb(null, null);
        });

      } else {
        cb(null, null);
      }
    }//----------------------------------------------------------------
  ], function (err) {
    if (err) { new IOError(null, constants.IO_DISCONNECT, err.message)  }

    socket.disconnect(); // отключаемся
  });
};
