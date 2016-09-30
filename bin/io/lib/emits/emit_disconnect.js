var constants = require('../../../constants');
    closeConnection = require('../common/close_connection');

var oPool = require('../../../objects_pool');

/*
Отключаемся от базы поистечении таймаута
 */
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

