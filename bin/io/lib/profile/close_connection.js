/**
 * Закрываем соединение
 *
 * @param socket
 */

const async  =  require('async');

const logger          = require('./../../../../lib/log')(module);
const Config          = require('./../../../../config.json');
const constants       = require('./../../../constants');
const oPool           = require('./../../../objects_pool');
const stat            = require('./../../../stat_manager');

const emitAllRooms    = require('../common/emit_all_rooms');
const sendUsersInRoom = require('./../common/send_users_in_room');

const PF              = constants.PFIELDS;
const EXIT_TIMEOUT    = Number(Config.io.exit_timeout);

module.exports = function (socket) {
  socket.on(constants.IO_DISCONNECT, function() {
    let selfProfile = oPool.userList[socket.id];
    if(!selfProfile) { return socket.disconnect(); }
    
    selfProfile.setExitTimeout( setTimeout(
      (function(socket) {
        return function() {
    
          let selfProfile = oPool.userList[socket.id];
    
          async.waterfall([//----------------------------------------------------------------
            function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
        
              let info = {
                [PF.ID]   : selfProfile.getID(),
                [PF.VID]  : selfProfile.getVID()
              };
        
        
              for(let r in oPool.rooms) if(oPool.rooms.hasOwnProperty(r)) {
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
        
              let room = oPool.roomList[socket.id];
        
              if (room) {
                room.deleteProfile(selfProfile);
          
                delete oPool.roomList[socket.id];
                delete oPool.profiles[selfProfile.getID()];
          
                if (room.getCountInRoom(constants.GUY) == 0 && room.getCountInRoom(constants.GIRL) == 0) {
                  delete oPool.rooms[room.getName()];
                  room = null;
                } else {
                  // checkTrack(room, selfProfile);
                  room.getMusicPlayer().checkTrack(room, selfProfile);
                }
          
                // Статистика
                let msInGame = new Date() - selfProfile.getInitTime();
                stat.setUserStat(selfProfile.getID(), selfProfile.getVID(), constants.SFIELDS.GAME_TIME, msInGame);
              }
              cb(null, room);
            },//----------------------------------------------------------------
            function (room, cb) { // Получаем данные по игрокам в комнате (для стола) и рассылаем всем
              if(room) {

                sendUsersInRoom(room, selfProfile.getID());

                let params = {
                  [PF.ID]   : selfProfile.getID(),
                  [PF.VID]  : selfProfile.getVID()
                };
            
                emitAllRooms(socket, constants.IO_OFFLINE, params);
              }
              cb(null, null);
            }//----------------------------------------------------------------
          ], function (err) {
            if (err) { logger.error(constants.IO_DISCONNECT + err);  }
      
            socket.disconnect(); // отключаемся
          });
    
        }
      })(socket), EXIT_TIMEOUT));
    
  });
};