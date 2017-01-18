/**
 * Устанавливаем таймаут времени,
 * в течение которого профиль будет хранить информацию о
 * полседнем подарке пользователю
 *
 * По истечении времени шлем всем в комнате обновленные сведения (убрать подарок с авы на игровом столе)
 *
 * @param id - ид пользователя
 */

const constants = require('./../../../constants');
const oPool  = require('./../../../objects_pool');

const PF = constants.PFIELDS;

// Устанавливем таймаут, через который подарки должны исчезать с аватара игрока
module.exports = function (profile, type) {
  
  let socket = profile.getSocket();
  if(socket) {
    let room = oPool.roomList[socket.id];
    if(room) {
      let res = {
        [PF.ID]   : profile.getID(),
        [PF.VID]  : profile.getVID(),
        [PF.TYPE] : type
      };
  
      socket.broadcast.in(room.getName()).emit(constants.IO_HIDE_GIFT, res);
      socket.emit(constants.IO_HIDE_GIFT, res);
    }
  }

};