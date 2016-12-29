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
const oPool  = require('./../../../objects_pool');

const sendUsersInRoom = require('./send_users_in_room');

const GIFT_TIMEOUT = Number(Config.user.settings.gift_timeout);

// Устанавливем таймаут, через который подарки должны исчезать с аватара игрока
//TODO: Переделать - чтобы при подраке тому же игроку, снимался таймер, если он для него
module.exports = function(id) {
  setTimeout(function () {
    let  profile = oPool.profiles[id];
    if(profile) {
      profile.clearGiftInfo(function() {
        
        let  roomInfo = oPool.roomList[profile.getSocket().id].getInfo();
        
        sendUsersInRoom(roomInfo, null, function(err, roomInfo) {
          if(err) {
            return logger('setGiftTimeout' + err);
          }
        });
      });
    }
  }, GIFT_TIMEOUT);
};