/**
 * Устанавливаем обработчик отключения с таймаутом для указанного сокета
 *
 * @param socket
 */

var constants         = require('../../../constants'),
    closeConnection   = require('../common/close_connection'),
    oPool             = require('../../../objects_pool');

module.exports = function (socket) {
  socket.on(constants.IO_DISCONNECT, function() {
    var selfProfile = oPool.userList[socket.id];
    if(selfProfile) {
      selfProfile.setExitTimeout(
        setTimeout(function(){
          closeConnection(socket);
        }, constants.EXIT_TIMEOUT));
    }
  });
};

