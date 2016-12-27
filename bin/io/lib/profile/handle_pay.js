/**
 * Created by Ruslan on 26.12.2016.
 *
 * Обрабатываем событие начисления монет
 */

var constants = require('./../../../constants');

var PF = constants.PFIELDS;

module.exports = function (profile, money) {
  
  var socket = profile.getSocket();
  
  if(socket) {
    var res = {};
    res[PF.MONEY] = money;
    
    socket.emit(constants.IO_GET_MONEY, res);
  }
};