var constants = require('../../constants');
var checkInput = require('./../../check_input');
var GameError = require('./../../game_error');

var oPool = require('./../../objects_pool');

// Освободить игрока из темницы
module.exports = function (socket) {
  socket.on(constants.IO_RELEASE_PLAYER, function(options) {
    if (!checkInput(constants.IO_RELEASE_PLAYER, socket, options)) { return; }

    var selfProfile = oPool.userList[socket.id];
    var game = selfProfile.getGame();
    var prisonerInfo = game.getPrisonerInfo();

    // Если серди заблокированных игроков такого нет, выдаем ошибку
    if(!prisonerInfo) {
      return handError(constants.errors.NOT_IN_PRISON);
    }

    if(selfProfile.getID() == prisonerInfo.id) {
      return handError(constants.errors.SELF_ILLEGAL);
    }

    // Проверяем - хватает ли монет у того, кто выкупает
    selfProfile.getMoney(function(err, money) {
      if(err) { return handError(err); }

      var newMoney = money - constants.RANSOM;

      if(newMoney < 0) {
        return handError(constants.errors.TOO_LITTLE_MONEY);
      }

      // Снимаем монеты
      selfProfile.setMoney(newMoney, function(err, money) {
        if(err) { return handError(err); }

        // Снимаем блокировку
        game.clearPrison();

        var options = {
          id  : prisonerInfo.id,
          vid : prisonerInfo.vid
        };

        // Оповещаем игроков в комнате
        socket.broadcast.in(game.gRoom.name).emit(constants.IO_RELEASE_PLAYER, options);

        options.operation_status = constants.RS_GOODSTATUS;
        socket.emit(constants.IO_RELEASE_PLAYER, options);

        // Оповещаем об изменившемся счете
        socket.emit(constants.IO_GET_MONEY, { money : money });
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