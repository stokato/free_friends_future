/**
 * Устанавливаем таймаут времени,
 * в течение которого профиль будет хранить информацию о
 * полседнем подарке пользователю
 *
 * По истечении времени шлем всем в комнате обновленные сведения (убрать подарок с авы на игровом столе)
 *
 * @param id - ид пользователя
 */

var Config        = require('./../../../../config.json');
var constants     = require('./../../../constants'),
  sendUsersInRoom = require('./send_users_in_room'),
  IOError         = require('./../common/io_error'),
  oPool           = require('./../../../objects_pool');

var GIFT_TIMEOUT = Number(Config.user.settings.gift_timeout);

// Устанавливем таймаут, через который подарки должны исчезать с аватара игрока
module.exports = function(id) {
  setTimeout(function () {
    var profile = oPool.profiles[id];
    if(profile) {
      profile.clearGiftInfo(function() {
        
        var roomInfo = oPool.roomList[profile.getSocket().id].getInfo();
        
        sendUsersInRoom(roomInfo, null, function(err, roomInfo) {
          if(err) {
            return new IOError(constants.IO_MAKE_GIFT, err.message || constants.errors.OTHER.message);
          }
        });
      });
    }
  }, GIFT_TIMEOUT);
};