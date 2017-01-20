/**
 * Закрываем соединение
 *
 * @param socket
 */

const async  =  require('async');

const logger    = require('./../../../../lib/log')(module);
const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');
const oPool     = require('./../../../objects_pool');
const statCtrlr = require('./../../../stat_manager');

const emitAllRooms    = require('../common/emit_all_rooms');

module.exports = function (socket) {
  
  const EXIT_TIMEOUT  = Number(Config.io.exit_timeout);
  const GUY           = Config.user.constants.sex.male;
  const GIRL          = Config.user.constants.sex.female;
  
  socket.on(Config.io.emits.IO_DISCONNECT, function() {
    let selfProfile = oPool.userList[socket.id];
    if(!selfProfile) {
      return socket.disconnect();
    }
    
    selfProfile.setExitTimeout( setTimeout(((socket) => {
        return function() {
    
          let selfProfile = oPool.userList[socket.id];
    
          async.waterfall([//----------------------------------------------------------------
            function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
  
              let paramsObj = {
                [PF.ID]   : selfProfile.getID(),
                [PF.VID]  : selfProfile.getVID()
              };
  
              emitAllRooms(socket, Config.io.emits.IO_OFFLINE, paramsObj);
        
              cb(null, null);
            }, //----------------------------------------------------------------
            function (res, cb) { // сохраняем профиль в базу
        
              selfProfile.save((err) => {
                if (err) {
                  return cb(err, null);
                }
          
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
          
                if (room.getCountInRoom(GUY) == 0 && room.getCountInRoom(GIRL) == 0) {
                  delete oPool.rooms[room.getName()];
                  room = null;
                } else {
                  room.getMusicPlayer().checkTrack(room, selfProfile);
                }
          
                // Статистика
                let msInGame = new Date() - selfProfile.getInitTime();
                statCtrlr.setUserStat(selfProfile.getID(), selfProfile.getVID(), PF.GAME_TIME, msInGame);
              
                selfProfile.close();
              }
              cb(null, room);
            } //----------------------------------------------------------------
          ], function (err) {
            if (err) {
              logger.error(Config.io.emits.IO_DISCONNECT + err);
            }
      
            socket.disconnect(); // отключаемся
          });
    
        }
      })(socket), EXIT_TIMEOUT));
    
  });
};