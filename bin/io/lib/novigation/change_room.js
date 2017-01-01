/**
 * Переходим в другую комнату
 *
 * @param socket, options - объект с идентификатором комнаты
 * @return rooms - список комнат
 */

const  async          = require('async');

const Config          = require('./../../../../config.json');
const constants       = require('./../../../constants');
const oPool           = require('./../../../objects_pool');

const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitizer');
const createRoom      = require('./../common/create_room');
const getLastMessages = require('./../common/get_last_messages');
const sendUsersInRoom = require('./../common/send_users_in_room');

const  PF                   = constants.PFIELDS;
const  ROOM_CHANGE_TIMEOUT  = Number(Config.user.settings.room_change_timeout);

module.exports = function (socket, options) {
  
  options[PF.ROOM] = sanitize(options[PF.ROOM]);
  
  // Ошибка, если нет комнаты с таким идентификатором
  if(!oPool.rooms[options[PF.ROOM]] && options[PF.ROOM] != constants.NEW_ROOM) {
    return emitRes(constants.errors.NO_SUCH_ROOM, socket ,constants.IO_CHANGE_ROOM);
  }
  
  // Если уже в этой комнате - ничего не делаем
  if(oPool.roomList[socket.id].getName() == options[PF.ROOM]){
    return emitRes(null, socket, constants.IO_CHANGE_ROOM);
  }
  
  let  selfProfile = oPool.userList[socket.id];
  
  // Ошибка - если таймаут на смену комнаты еще не истек
  if(oPool.roomChangeLocks[selfProfile.getID()]) {
    return emitRes(constants.errors.ACTON_TIMEOUT, socket, constants.IO_CHANGE_ROOM);
  }
  
  let  newRoom = null;
  let  currRoom = oPool.roomList[socket.id];
  let  userSex = selfProfile.getSex();
  
  //TODO: Эту возможность следует потом убрать
  if (options.room == constants.NEW_ROOM) { // Либо создаем новую комнату
    newRoom = createRoom(socket, oPool.userList);
    oPool.rooms[newRoom.getName()] = newRoom;
    
  } else {                                  // Либо ищем указанную
    let  item;
    for (item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)) {
      if (oPool.rooms[item].getName() == options[PF.ROOM]) {
        if (oPool.rooms[item].getCountInRoom(userSex) >= constants.ONE_SEX_IN_ROOM) {
          return emitRes(constants.errors.ROOM_IS_FULL, socket, constants.IO_CHANGE_ROOM);
        }
        newRoom = oPool.rooms[item];
      }
    }
  }
  
  if (!newRoom) {
    return emitRes(constants.errors.NO_SUCH_ROOM, socket, constants.IO_CHANGE_ROOM);
  }
  
  currRoom.getRanks().deleteEmits(socket);
  currRoom.getMusicPlayer().deleteEmits(socket);
  currRoom.deleteProfile(selfProfile);
  
  
  // Удаляем комнату, если она опустела
  let  isCurrRoom = true;
  if (currRoom.getCountInRoom(constants.GUY) == 0 && currRoom.getCountInRoom(constants.GIRL) == 0) {
    delete oPool.rooms[currRoom.getName()];
    isCurrRoom = false;
  } else {
    currRoom.getMusicPlayer().checkTrack(currRoom, selfProfile);
  }
  
  newRoom.addProfile(selfProfile);
  newRoom.getMusicPlayer().addEmits(socket);
  newRoom.getRanks().addEmits(socket);
  
  oPool.roomList[socket.id] = newRoom;
  
  async.waterfall([//-----------------------------------------------------------------------
    function (cb) { // Если пользователь перешел из другой комнаты, обновляем в ней список участников
      if(isCurrRoom) {
        let  currRoomInfo = currRoom.getInfo();
  
        sendUsersInRoom(currRoomInfo, null, function(err) {
          if(err) { return cb(err); }
    
          cb(null, null);
        });

      } else {
        cb(null, null);
      }
    },//-----------------------------------------------------------------------
    function (res, cb) { // Устанавливаем таймаут на смену комнаты для этого пользователя
      
      let  info = newRoom.getInfo();
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
      return emitRes(err, socket, constants.IO_CHANGE_ROOM);
    }
    
    emitRes(null, socket, constants.IO_CHANGE_ROOM);
  
    newRoom.getGame().start(socket);
  
    // startTrack(socket, newRoom);
    newRoom.getMusicPlayer().startTrack(socket, newRoom);
    getLastMessages(socket, newRoom);
    
    newRoom.getRanks().emitAddBall(selfProfile.getID());
  });//-----------------------------------------------------------------------
  
  
  //---------------------
  function setChangeTimeout(locks, selfid, delay) {
    setTimeout(function () {
      let  lock = String(selfid);
      delete locks[lock];
    }, delay);
  }
};

