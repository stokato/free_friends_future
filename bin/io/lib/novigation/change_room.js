/**
 * Переходим в другую комнату
 *
 * @param socket, options - объект с идентификатором комнаты
 * @return rooms - список комнат
 */

// Свои модули
var Config = require('./../../../../config.json');

var async         = require('async'),      // Ошибки
  constants       = require('./../../../constants'),     // Константы
  PF              = constants.PFIELDS,
  createRoom      = require('./../common/create_room'),
  getLastMessages = require('./../common/get_last_messages'),
  sendUsersInRoom = require('./../common/send_users_in_room'),
  startTrack      = require('./../player/start_track'),
  checkTrack      = require('./../player/check_track'),
  oPool           = require('./../../../objects_pool');

var ROOM_CHANGE_TIMEOUT = Number(Config.user.settings.room_change_timeout);

module.exports = function (socket, options, callback) {
  
  // Ошибка, если нет комнаты с таким идентификатором
  if(!oPool.rooms[options[PF.ROOM]] && options[PF.ROOM] != constants.NEW_ROOM) {
    return callback(constants.errors.NO_SUCH_ROOM);
  }
  
  // Если уже в этой комнате - ничего не делаем
  if(oPool.roomList[socket.id].getName() == options[PF.ROOM]){
    // return callback(constants.errors.ALREADY_IN_ROOM);
    return callback(null, null);
  }
  
  var selfProfile = oPool.userList[socket.id];
  
  // Ошибка - если таймаут на смену комнаты еще не истек
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
  
  currRoom.deleteProfile(selfProfile);
  
  // Удаляем комнату, если она опустела
  var isCurrRoom = true;
  if (currRoom.getCountInRoom(constants.GUY) == 0 && currRoom.getCountInRoom(constants.GIRL) == 0) {
    delete oPool.rooms[currRoom.getName()];
    isCurrRoom = false;
  } else {
    checkTrack(currRoom, selfProfile);
  }
  
  newRoom.addProfile(selfProfile);
  
  oPool.roomList[socket.id] = newRoom;
  
  async.waterfall([//-----------------------------------------------------------------------
    function (cb) { // Если пользователь перешел из другой комнаты, обновляем в ней список участников
      if(isCurrRoom) {
        var currRoomInfo = currRoom.getInfo();
  
        sendUsersInRoom(currRoomInfo, null, function(err) {
          if(err) { return cb(err); }
    
          cb(null, null);
        });

      } else {
        cb(null, null);
      }
    },//-----------------------------------------------------------------------
    function (res, cb) { // Устанавливаем таймаут на смену комнаты для этого пользователя
      
      var info = newRoom.getInfo();
      oPool.roomChangeLocks[selfProfile.getID()] = true;
      setChangeTimeout(oPool.roomChangeLocks, selfProfile.getID(), ROOM_CHANGE_TIMEOUT);
    
      cb(null, info);
    },//-----------------------------------------------------------------------
    function (info, cb) { // Отправляем в комнату новые слведения
      sendUsersInRoom(info, null, function(err) {
        if(err) { return cb(err) }
    
        cb(null, null);
      });
    }//-----------------------------------------------------------------------
  ], function (err) {
    if(err) {
      return callback(err);
    }
    
    callback(null, null);
  
    newRoom.getGame().start(socket);
  
    startTrack(socket, newRoom);
    getLastMessages(socket, newRoom);
  });//-----------------------------------------------------------------------
  
  
  //---------------------
  function setChangeTimeout(locks, selfid, delay) {
    setTimeout(function () {
      var lock = String(selfid);
      delete locks[lock];
    }, delay);
  }
};

