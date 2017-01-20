/**
 * Переходим в другую комнату
 *
 * @param socket, options - объект с идентификатором комнаты
 * @return rooms - список комнат
 */

const  async          = require('async');

const Config          = require('./../../../../config.json');
const  PF             = require('./../../../const_fields');
const oPool           = require('./../../../objects_pool');

const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitize');
const createRoom      = require('./../common/create_room');
const getLastMessages = require('./../common/get_last_messages');

module.exports = function (socket, options) {
  
  const GUY = Config.user.constants.sex.male;
  const GIRL = Config.user.constants.sex.female;
  
  const ROOM_CHANGE_TIMEOUT  = Number(Config.user.settings.room_change_timeout);
  const ONE_SEX_IN_ROOM  = Config.io.one_sex_in_room;
  const NEW_ROOM = Config.io.new_room;
  const IO_CHANGE_ROOM = Config.io.emits.IO_CHANGE_ROOM;
  
  options[PF.ROOM] = sanitize(options[PF.ROOM]);
  
  // Ошибка, если нет комнаты с таким идентификатором
  if(!oPool.rooms[options[PF.ROOM]] && options[PF.ROOM] != NEW_ROOM) {
    return emitRes(Config.errors.NO_SUCH_ROOM, socket ,IO_CHANGE_ROOM);
  }
  
  // Если уже в этой комнате - ничего не делаем
  if(oPool.roomList[socket.id].getName() == options[PF.ROOM]){
    return emitRes(null, socket, IO_CHANGE_ROOM);
  }
  
  let  selfProfile = oPool.userList[socket.id];
  
  // Ошибка - если таймаут на смену комнаты еще не истек
  if(oPool.roomChangeLocks[selfProfile.getID()]) {
    return emitRes(Config.errors.ACTON_TIMEOUT, socket, IO_CHANGE_ROOM);
  }
  
  let  newRoom = null;
  let  currRoom = oPool.roomList[socket.id];
  let  userSex = selfProfile.getSex();
  
  //--------------------------------------------------------------------------
  //TODO: Эту возможность следует потом убрать
  if (options.room == NEW_ROOM) { // Либо создаем новую комнату
    newRoom = createRoom(socket, oPool.userList);
    oPool.rooms[newRoom.getName()] = newRoom;
    
  } else {
    //--------------------------------------------------------------------------
    // Либо ищем указанную
    for (let item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)) {
      if (oPool.rooms[item].getName() == options[PF.ROOM]) {
        if (oPool.rooms[item].getCountInRoom(userSex) >= ONE_SEX_IN_ROOM) {
          
          return emitRes(Config.errors.ROOM_IS_FULL, socket, IO_CHANGE_ROOM);
          
        }
        newRoom = oPool.rooms[item];
      }
    }
  } //
  
  if (!newRoom) {
    return emitRes(Config.errors.NO_SUCH_ROOM, socket, IO_CHANGE_ROOM);
  }
  
  currRoom.getRanks().deleteEmits(socket);
  currRoom.getMusicPlayer().deleteEmits(socket);
  currRoom.deleteProfile(selfProfile);
  
  
  // Удаляем комнату, если она опустела
  if (currRoom.getCountInRoom(GUY) == 0 && currRoom.getCountInRoom(GIRL) == 0) {
    delete oPool.rooms[currRoom.getName()];

  } else {
    currRoom.getMusicPlayer().checkTrack(currRoom, selfProfile);
  }
  
  async.waterfall([//-----------------------------------------------------------------------
    function (cb) { // Если пользователь перешел из другой комнаты, обновляем в ней список участников
      newRoom.addProfile(selfProfile, (err) => {
        if(err) {
          return cb(err, null);
        }

        newRoom.getMusicPlayer().addEmits(socket);
        newRoom.getRanks().addEmits(socket);

        oPool.roomList[socket.id] = newRoom;
        
        cb(null, null);
      });

    },//-----------------------------------------------------------------------
    function (res, cb) { // Устанавливаем таймаут на смену комнаты для этого пользователя

      oPool.roomChangeLocks[selfProfile.getID()] = true;
      setChangeTimeout(oPool.roomChangeLocks, selfProfile.getID(), ROOM_CHANGE_TIMEOUT);
      
      cb(null, null);
    }//-----------------------------------------------------------------------
  ], function (err) {
    if(err) {
      return emitRes(err, socket, IO_CHANGE_ROOM);
    }
    
    emitRes(null, socket, IO_CHANGE_ROOM);
    
    let info = newRoom.getPersonalInfo(selfProfile.getID());
    
    socket.emit(Config.io.emits.IO_ROOM_USERS, info);
  
    newRoom.getGame().start(socket);
    
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

