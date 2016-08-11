var constants = require('./../../constants');
    closeConnection = require('./close_connection');

/*
Отключаемся от базы поистечении таймаута
 */
module.exports = function (socket, userList, profiles, roomList, rooms) {
  socket.on(constants.IO_DISCONNECT, function() {
    var selfProfile = userList[socket.id];
    if(selfProfile) {
      selfProfile.setExitTimeout(
        setTimeout(function(){
          closeConnection(socket, userList, profiles, roomList, rooms);
        }, constants.EXIT_TIMEOUT));
    }
  });
};

