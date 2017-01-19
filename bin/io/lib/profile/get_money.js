/**
 * Получаем текущий баланс пользователя
 *
 * @param socket, options, callback
 * @return {Object} - объект с количеством монет
 */

const Config    = require('./../../../../config.json');
const PF = require('./../../../const_fields');
const oPool     = require('./../../../objects_pool');
const emitRes   = require('./../../../emit_result');

module.exports = function (socket, options) {
  
  oPool.userList[socket.id].getMoney(function (err, money) {
    if (err) {  return emitRes(err, socket, Config.io.emits.IO_GET_MONEY); }
    
    let res = { [PF.MONEY] : money };
  
    emitRes(null, socket, Config.io.emits.IO_GET_MONEY, res);
  });
  
};


