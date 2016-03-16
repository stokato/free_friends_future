
var GameError = require('./../../../game_error'),
  checkInput = require('./../../../check_input');
/////////////////////////// ПОДАРКИ ////////////////////////////////////////////////////////////////////////
/*
 Изменить количество монет на счету
 */
module.exports = function (socket, userList) {
  socket.on('change_money', function(options) {
    if (!checkInput('change_money', socket, userList, options))
      return new GameError(socket, "CHANGEMONEY", "Верификация не пройдена");

    userList[socket.id].setMoney(options.money, function (err, money) {
      if (err) {
        return new GameError(socket, "CHANGEMONEY", "Не удалось изменить счет игрока");
      }

      socket.emit('change_money', options);
    })
  });
};


