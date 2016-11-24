
// Свои модули
var async         = require('async'),      // Ошибки
  constants       = require('./../../../constants'),     // Константы
  PF              = constants.PFIELDS,
  createRoom      = require('./../common/create_room'),
  getLastMessages = require('./../common/get_last_messages'),
  sendUsersInRoom = require('./../common/send_users_in_room'),
  playTrackInRoom = require('./../player/play_track_in_room'),
  oPool           = require('./../../../objects_pool');

/*
 Сменить комнату: Идентификатор новой комнаты
 - Получаем свой профиль
 - Узнаем пол
 - Если создаем комнату (клиент может создавать комнаты ?)
 -- Созадем новый объект комнаты и геним ему идентификатор
 - Если выбираем из имеющихся
 -- Отправляем клиенту последние сообщения комнаты (сколько ???)
 - Отвязываеся от старой комнаты
 - Связываемся с новой
 - Получаем данные профиля (какие ???)
 - Добавляем к ним данные игроков (девушки и парни на игровом столе)
 - Отправляем клиенту
 */
module.exports = function (socket, options, callback) {
  
  if(!oPool.rooms[options[PF.ROOM]] && options[PF.ROOM] != constants.NEW_ROOM) {
    return callback(constants.errors.NO_SUCH_ROOM);
  }
  
  if(oPool.roomList[socket.id].getName() == options[PF.ROOM]){
    // return callback(constants.errors.ALREADY_IN_ROOM);
    return callback(null, null); // Если уже в этой комнате - ничего не делаем
  }
  
  var selfProfile = oPool.userList[socket.id];
  
  // Если таймаут на смену комнаты еще не истек, возвращаем ошибку
  if(oPool.roomChangeLocks[selfProfile.getID()]) {
    return callback(constants.errors.ACTON_TIMEOUT);
  }
  
  var newRoom = null;
  var currRoom = oPool.roomList[socket.id];
  var userSex = selfProfile.getSex();
  
  //TODO: Эту возможность следует потом убрать
  if (options.room == constants.NEW_ROOM) { // Либо создаем новую комнату
    newRoom = createRoom(socket, oPool.userList);
    oPool.rooms[newRoom.getName()] = newRoom;
    
  } else {                                  // Либо ищем указанную
    var item;
    for (item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)) {
      if (oPool.rooms[item].getName() == options[PF.ROOM]) {
        if (oPool.rooms[item].getCountInRoom(userSex) >= constants.ONE_SEX_IN_ROOM) {
          return callback(constants.errors.ROOM_IS_FULL);
        }
        newRoom = oPool.rooms[item];
      }
    }
  }
  
  if (!newRoom) {
    return callback(constants.errors.NO_SUCH_ROOM);
  }
  
  currRoom.deleteProfile(userSex, selfProfile);
  
  var isCurrRoom = true;
  if (currRoom.getCountInRoom(constants.GUY) == 0 && currRoom.getCountInRoom(constants.GIRL) == 0) {
    delete oPool.rooms[currRoom.getName()];
    isCurrRoom = false;
  }
  
  newRoom.addProfile(userSex, selfProfile);
  
  oPool.roomList[socket.id] = newRoom;
  
  async.waterfall([
    function (cb) {
      // Если пользователь перешел из другой комнаты, обновляем в ней список участников
      if(isCurrRoom) {
        var currRoomInfo = currRoom.getInfo();
  
        sendUsersInRoom(currRoomInfo, null, function(err) {
          if(err) { return cb(err); }
    
          cb(null, null);
        });

      } else {
        cb(null, null);
      }
    },
    function (res, cb) {
      
      var info = newRoom.getInfo();
      oPool.roomChangeLocks[selfProfile.getID()] = true;
      setChangeTimeout(oPool.roomChangeLocks, selfProfile.getID(), constants.TIMEOUT_ROOM_CHANGE);
    
      cb(null, info);
    },
    function (info, cb) {
      sendUsersInRoom(info, null, function(err) {
        if(err) { return cb(err) }
    
        cb(null, null);
      });
    }
  ], function (err) {
    if(err) {
      return callback(err);
    }
    
    callback(null, null);
  
    newRoom.getGame().start(socket);
  
    playTrackInRoom(socket, newRoom);
    getLastMessages(socket, newRoom);
  });
  
  
  //---------------------
  function setChangeTimeout(locks, selfid, delay) {
    setTimeout(function () {
      var lock = String(selfid);
      delete locks[lock];
    }, delay);
  }
};

