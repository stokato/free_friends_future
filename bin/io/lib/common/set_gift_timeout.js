/**
 * Устанавливаем таймаут времени,
 * в течение которого профиль будет хранить информацию о
 * полседнем подарке пользователю
 *
 * По истечении времени шлем всем в комнате обновленные сведения (убрать подарок с авы на игровом столе)
 *
 * @param id - ид пользователя
 */

const logger = require('./../../../../lib/log')(module);

const Config = require('./../../../../config.json');
const constants = require('./../../../constants');
const oPool  = require('./../../../objects_pool');

// const sendUsersInRoom = require('./get_users_in_room');

const GIFT_TIMEOUT = Number(Config.user.settings.gift_timeout);

// Устанавливем таймаут, через который подарки должны исчезать с аватара игрока
module.exports = function(id) {

  let  profile = oPool.profiles[id];
  let socket = profile.getSocket();
  let room = oPool.roomList[socket.id];

  let timer = setTimeout(function () {
    let  profile = oPool.profiles[id];
    if(profile) {
      profile.clearGiftInfo(function() {
        
        let socket = profile.getSocket();
        if(socket) {
          let room = oPool.roomList[socket.id];
          let res = {
            [constants.PFIELDS.ID]  : profile.getID(),
            [constants.PFIELDS.VID] : profile.getVID()
          };
          
          socket.broadcast.in(room.getName()).emit(constants.IO_HIDE_GIFT, res);
          socket.emit(constants.IO_HIDE_GIFT, res);
        }
        
      });
    }
  }, GIFT_TIMEOUT);

  room.setGiftTimer(id, timer);
};