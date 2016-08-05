var checkInput = require('./../../check_input');
var constants_io = require('../../io/constants');
var constants = require('../constants');
var GameError = require('./../../game_error');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, userList) {
  socket.on(constants_io.IO_RELEASE_PLAYER, function(options) {

    if (!checkInput(constants_io.IO_RELEASE_PLAYER, socket, userList, options)) {
      return;
    }

    //var f = constants_io.FIELDS;
    var selfProfile = userList[socket.id];
    var game = selfProfile.getGame();
    var prisonerInfo = game.gPrisoner;

    if(selfProfile.getID() == prisonerInfo.id) {
      return new GameError(socket, constants_io.IO_RELEASE_PLAYER, "Нельзя выкупить себя из тюрьмы");
    }

    // Если серди заблокированных игроков такого нет, выдаем ошибку
    if(!prisonerInfo) {
      return new GameError(socket, constants_io.IO_RELEASE_PLAYER, "Этот игрок не находится в тюрьме");
    }

    // Проверяем - хватает ли монет у того, кто выкупает
    selfProfile.getMoney(function(err, money) {
      if(money - constants.RANSOM < 0) {
        //return new GameError(socket, constants_io.IO_RELEASE_PLAYER, "Недостаточно монет для выкупа");
      }

      // Снимаем монеты
      selfProfile.setMoney(money, function(err, money) { // money - constants.RANSOM
        if(err) {
          return new GameError(socket, constants_io.IO_RELEASE_PLAYER, err.message);
        }

        // Снимаем блокировку
        game.gPrisoner = null;

        var options = {};
        options.id = prisonerInfo.id;
        options.vid = prisonerInfo.vid;

        // Оповещаем игроков в комнате
        socket.emit(constants_io.IO_RELEASE_PLAYER, options);
        socket.broadcast.in(game.gRoom.name).emit(constants_io.IO_RELEASE_PLAYER, options);
      });
    });
  });
};