/**
 * Created by Ruslan on 26.12.2016.
 *
 * Обрабатываем событие начисления монет
 */

const Config  = require('./../../../../config.json');
const PF = require('./../../../const_fields');

module.exports = function (profile, money) {
  
  let socket = profile.getSocket();
  
  if(socket) {
    socket.emit(Config.io.emits.IO_GET_MONEY, { [PF.MONEY] : money });
  }
};