var GameError = require('../../game_error'),
  checkInput = require('../../check_input'),
  constants = require('./../constants');
/*
 Показать текущий баланс
 */
module.exports = function (socket, userList) {
  socket.on(constants.IO_GET_MONEY, function() {
    if (!checkInput(constants.IO_GET_MONEY, socket, userList, {})) { return; }

    var f = constants.FIELDS;
    userList[socket.id].getMoney(function (err, money) {
      if (err) {  return new GameError(socket, constants.IO_GET_MONEY, err.message); }

      var result = {};
      result[f.money] = money;
      socket.emit(constants.IO_GET_MONEY, result);
    });
  });
};


