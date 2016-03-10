var GameError = require('../../game_error'),
  checkInput = require('../../check_input');
/*
 Показать текущий баланс
 */
module.exports = function (socket, userList) {
  socket.on('get_money', function() {
    if (!checkInput('get_money', socket, userList, null)) {
      return new GameError(socket, "GETMONEY", "Верификация не пройдена");
    }

    userList[socket.id].getMoney(function (err, money) {
      if (err) {  return new GameError(socket, "GETMONEY", err.message); }

      socket.emit('get_money', { money : money });
    });
  });
};


