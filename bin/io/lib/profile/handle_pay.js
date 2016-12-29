/**
 * Created by Ruslan on 26.12.2016.
 *
 * Обрабатываем событие начисления монет
 */

const constants = require('./../../../constants');
const PF = constants.PFIELDS;

module.exports = function (profile, money) {
  
  let socket = profile.getSocket();
  
  if(socket) {
    socket.emit(constants.IO_GET_MONEY, { [PF.MONEY] : money });
  }
};