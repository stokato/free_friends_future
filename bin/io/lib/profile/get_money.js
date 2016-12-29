/**
 * Получаем текущий баланс пользователя
 *
 * @param socket, options, callback
 * @return {Object} - объект с количеством монет
 */

const constants = require('./../../../constants');
const oPool     = require('./../../../objects_pool');
const emitRes   = require('./../../../emit_result');

module.exports = function (socket, options) {
  
  oPool.userList[socket.id].getMoney(function (err, money) {
    if (err) {  return emitRes(err, socket, constants.IO_GET_MONEY); }
    
    let res = { [constants.PFIELDS.MONEY] : money };
  
    emitRes(null, socket, constants.IO_GET_MONEY, res);
  });
  
};


