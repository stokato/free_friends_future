var constants = require('../../constants');

var checkInput = require('./../../check_input');
var GameError = require('./../../game_error');

var oPool = require('./../../objects_pool');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket) {
  socket.on(constants.IO_GAME, function(options) {
    if (!checkInput(constants.IO_GAME, socket, options)) { return; }

    var selfProfile = oPool.userList[socket.id];
    var uid = selfProfile.getID();
    var game = selfProfile.getGame();

    // Если этому пользователю можно ходить, и он еще не превысил лимит ходов
    if(game.gActivePlayers[uid] && game.gActionsLimits[uid] > 0) {
      if (!checkInput(game.gNextGame, socket, options)) { return; }

      // Если нет такого пользоателя среди кандидатов
      if(game.gNextGame == constants.G_BEST && !game.gStoredOptions[options.pick]) {
        return handError(constants.errors.NO_THAT_PLAYER);
      }

      // В игре симпатии нельзя указать себя
      if(game.gNextGame == constants.G_SYMPATHY && uid == options.pick) {
        return handError(constants.errors.SELF_ILLEGAL);
      }
      if(game.gNextGame == constants.G_SYMPATHY_SHOW && uid == options.pick) {
        return handError(constants.errors.SELF_ILLEGAL);
      }

      if(!game.gActionsQueue[uid]) {
        game.gActionsQueue[uid] = [];
      }

      // В игре Симпатии нельзя выбрать несколько раз одного и того же игрока
      // И выбрать того, кого нет
      if(game.gNextGame == constants.G_SYMPATHY || game.gNextGame == constants.G_SYMPATHY_SHOW) {
        if(!game.gActivePlayers[options.pick]) { return; }

        var actions = game.gActionsQueue[uid];

        for( var i = 0; i < actions.length; i++) {
          if(actions[i].pick == options.pick) { return; }
        }
      }

      // Уменьшаем счетчики ходов одного игрока и всех в текущем раунде
      game.gActionsLimits[uid] --;

      game.gActionsQueue[uid].push(options);
      game.gActionsCount--;

      // Вызваем обработчик текущей игры
      game.gHandlers[game.gNextGame](false, uid, options);
    }

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_GAME, res);

      new GameError(socket, constants.IO_GAME, err.message || constants.errors.OTHER.message);
    }
  });
};