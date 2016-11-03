
// Свои модули
var GameError = require('./../../../game_error'),      // Ошибки
  constants = require('./../../../constants'),     // Константы
  createRoom = require('./../common/create_room'),
  getLastMessages = require('./../common/get_last_messages'),
  getRoomInfo = require('./../common/get_room_info'),
  sendUsersInRoom = require('./../common/send_users_in_room'),
  playTrackInRoom = require('./../player/play_track_in_room');

var oPool = require('./../../../objects_pool');

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
  
  if(!oPool.rooms[options.room] && options.room != constants.NEW_ROOM) {
    return callback(constants.errors.NO_SUCH_ROOM);
  }
  
  if(oPool.roomList[socket.id].name == options.room){
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
  
  if (options.room == constants.NEW_ROOM) { // Либо создаем новую комнату
    newRoom = createRoom(socket, oPool.userList);
    oPool.rooms[newRoom.name] = newRoom;
    
  } else {                                  // Либо ищем указанную
    var item;
    for (item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)) {
      if (oPool.rooms[item].name == options.room) {
        if (oPool.rooms[item].getCountInRoom(userSex) >= constants.ONE_SEX_IN_ROOM) {
          return callback(constants.errors.ROOM_IS_FULL);
        }
        newRoom = oPool.rooms[item];
        
        getLastMessages(socket, oPool.rooms[item]);
      }
    }
  }
  
  if (!newRoom) {
    return callback(constants.errors.NO_SUCH_ROOM);
  }
  
  newRoom.addProfile(userSex, selfProfile);
  
  selfProfile.setGame(newRoom.game);
  
  oPool.roomList[socket.id] = newRoom;
  
  var isCurrRoom = true;
  
  currRoom.deleteProfile(userSex, selfProfile.getID());
  
  if (currRoom.getCountInRoom(constants.GUY) == 0 && currRoom.getCountInRoom(constants.GIRL) == 0) {
    delete oPool.rooms[currRoom.name];
    isCurrRoom = false;
  }
  
  currRoom.pushIndex(userSex, selfProfile.getGameIndex());
  selfProfile.setGameIndex(newRoom.popIndex(userSex));
  
  playTrackInRoom(socket, newRoom);
    
  getRoomInfo(newRoom, function (err, info) {
    if (err) { return new GameError(socket, constants.IO_CHANGE_ROOM, err.message); }
    
    socket.leave(currRoom.name,function () { });
    socket.join(newRoom.name);
    
    oPool.roomChangeLocks[selfProfile.getID()] = true;
    setChangeTimeout(oPool.roomChangeLocks, selfProfile.getID(), constants.TIMEOUT_ROOM_CHANGE);
        
    sendUsersInRoom(info, null, function(err, res) {
      if(err) { return callback(err) }
      
      newRoom.game.start(socket);
    });
    
    // Если пользователь перешел из другой комнаты, обновляем в ней список участников
    if(isCurrRoom) {
      getRoomInfo(currRoom, function(err, currRoomInfo) {
        if(err) { return callback(err); }
        
        sendUsersInRoom(currRoomInfo, null, function(err) {
          if(err) { return callback(err); }
          
          callback(null, null);
        });
        
      });
    } else {
      callback(null, null);
    }
  });
  
  //---------------------
  function setChangeTimeout(locks, selfid, delay) {
    setTimeout(function () {
      var lock = String(selfid);
      delete locks[lock];
    }, delay);
  }
  
};

