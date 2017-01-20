/**
 * Получаем историю приватных чатов за период и отравляем отдельными сообщениями
 *
 * @param socket, callback
 *
 */

const logger          = require('./../../../../lib/log')(module);
const Config          = require('./../../../../config.json');
const oPool           = require('./../../../objects_pool');
const genDateHistory  = require('./gen_date_history');

module.exports = function (socket) { // Получаем данные по приватным чатам и историю сооб
  let  secondDate = new Date();
  let  firstDate  = genDateHistory(secondDate);

  oPool.userList[socket.id].getPrivateChatsWithHistory(firstDate, secondDate, (err, history = []) => {
    
    if(err) {
      return logger('sendPrivateChats' + err);
    }
    
    let historyLen = history.length;
    
    for(let  i = 0; i < historyLen; i++) {
      socket.emit(Config.io.emits.IO_MESSAGE, history[i]);
    }
    
  });
};