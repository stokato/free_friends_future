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
module.exports = function(id) {

  let  profile = oPool.profiles[id];
  let socket = profile.getSocket();
  let room = oPool.roomList[socket.id];

  let timer = setTimeout(function () {
    let  profile = oPool.profiles[id];
    if(profile) {
      profile.clearGiftInfo(function() {

        sendUsersInRoom(oPool.roomList[profile.getSocket().id]);

      });
    }
  }, GIFT_TIMEOUT);

  room.setGiftTimer(id, timer);
};