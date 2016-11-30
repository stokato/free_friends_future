/**
 * Получаем историю приватных чатов за период и отравляем отдельными сообщениями
 *
 * @param socket, callback
 *
 */

var constants             = require('./../../../constants'),
    oPool                 = require('./../../../objects_pool'),
    genDateHistory        = require('./../common/gen_date_history');

module.exports = function (socket, callback) { // Получаем данные по приватным чатам и историю сооб
  var secondDate = new Date();
  var firstDate = genDateHistory(secondDate);

  oPool.userList[socket.id].getPrivateChatsWithHistory(firstDate, secondDate, function(err, history) {
    history = history || [];
    
    if(err) { return callback(err, null) }
    
    for(var i = 0; i < history.length; i++) {
      socket.emit(constants.IO_MESSAGE, history[i]);
    }
    
    callback(null, null);
  });
};