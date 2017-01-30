/**
 * Устанавливаем таймаут времени,
 * в течение которого профиль будет хранить информацию о
 * полседнем подарке пользователю
 *
 * По истечении времени шлем всем в комнате обновленные сведения (убрать подарок с авы на игровом столе)
 *
 * @param id - ид пользователя
 */

const Config    = require('./../../../../config.json');
const oPool  = require('./../../../objects_pool');

const PF = require('./../../../const_fields');

// Устанавливем таймаут, через который подарки должны исчезать с аватара игрока
module.exports = function (profile, gift) {
  
  let socket = profile.getSocket();
  if(socket) {
    let room = oPool.roomList[socket.id];
    if(room) {
      
      let resObj = {
        [PF.ID]       : profile.getID(),
        [PF.VID]      : profile.getVID(),
        [PF.TYPE]     : gift[PF.TYPE],
        [PF.UGIFTID]  : gift[PF.GIFTID],
        [PF.COUNT]    : gift[PF.COUNT]
      };
  
      socket.broadcast.in(room.getName()).emit(Config.io.emits.IO_HIDE_GIFT, resObj);
      socket.emit(Config.io.emits.IO_HIDE_GIFT, resObj);
    }
  }

};
