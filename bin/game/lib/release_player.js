var checkInput = require('./../../check_input');
var constants_io = require('../../io/constants');
var constants = require('../constants');
var GameError = require('./../../game_error');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, userList) {
  socket.on(constants_io.IO_RELEASE_PLAYER, function(options) {
    if (!checkInput(constants_io.IO_RELEASE_PLAYER, socket, userList, options)) { return; }

    var selfProfile = userList[socket.id];
    var game = selfProfile.getGame();
    var prisonerInfo = game.gPrisoner;

    // Если серди заблокированных игроков такого нет, выдаем ошибку
    if(!prisonerInfo) {
      return handError(constants_io.errors.NOT_IN_PRISON);
    }

    if(selfProfile.getID() == prisonerInfo.id) {
      return handError(constants_io.errors.SELF_ILLEGAL);
    }

    // Проверяем - хватает ли монет у того, кто выкупает
    selfProfile.getMoney(function(err, money) {
      if(money - constants.RANSOM < 0) {
        return handError(constants_io.errors.TOO_LITTLE_MONEY);
      }

      // Снимаем монеты
      selfProfile.setMoney(money, function(err, money) { // money - constants.RANSOM
        if(err) { return handError(err); }

        // Снимаем блокировку
        game.gPrisoner = null;

        var options = {};
        options.id = prisonerInfo.id;
        options.vid = prisonerInfo.vid;

        // Оповещаем игроков в комнате
        socket.broadcast.in(game.gRoom.name).emit(constants_io.IO_RELEASE_PLAYER, options);
        options.operation_status = constants_io.RS_GOODSTATUS;
        socket.emit(constants_io.IO_RELEASE_PLAYER, options);
      });
    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_RELEASE_PLAYER, res);

      new GameError(socket, constants.IO_RELEASE_PLAYER, err.message || constants.errors.OTHER.message);
    }
  });
};