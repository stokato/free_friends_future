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

// Устанавливем таймаут, через который подарки должны исчезать с аватара игрока
module.exports = function (profile) {
  
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

};
