var GameError = require('../../../game_error'),              // Ошибки
  checkInput = require('../../../check_input'),            // Верификация
  constants  = require('../../../constants');


module.exports = function(socket, userList) {
  socket.on(constants.IO_ADD_POINTS, function() {
    if (!checkInput(constants.IO_ADD_POINTS, socket, userList, {})) {
      return;
    }

    var selfProfile = userList[socket.id];
    selfProfile.addPoints(1, function(err, points) {
      if(err) { return new GameError(socket, constants.IO_ADD_POINTS,
                            "Ошибка при начислении очков пользователю");}

      socket.emit(constants.IO_ADD_POINTS, points);
    });
  });
};
