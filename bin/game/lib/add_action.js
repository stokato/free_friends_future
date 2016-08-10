var checkInput = require('./../../check_input');
var constants_io = require('../../io/constants');
var constants = require('../constants');
var GameError = require('./../../game_error');
//var sanitize        = require('../../sanitizer');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, userList) {
  socket.on(constants_io.IO_GAME, function(options) {
    if (!checkInput(constants_io.IO_GAME, socket, userList, options)) { return; }

    var selfProfile = userList[socket.id];
    var uid = selfProfile.getID(),
        game = selfProfile.getGame();

    //var pick = sanitize(options.pick);

    // Если этому пользователю можно ходить, и он еще не превысил лимит ходов
    if(game.gActivePlayers[uid] && game.gActionsLimits[uid] > 0) {
      if (!checkInput(game.gNextGame, socket, userList, options)) { return; }

      if(game.gNextGame == constants.G_BEST && !game.gStoredOptions[options.pick]) { // Если нет такого пользоателя среди кандидатов
        return handError(constants_io.errors.NO_THAT_PLAYER);
      }

      if(game.gNextGame == constants.G_SYMPATHY && uid == options.pick) {
        return handError(constants_io.errors.SELF_ILLEGAL);
      }

      if(game.gNextGame == constants.G_SYMPATHY_SHOW && uid == options.pick) {
        return handError(constants_io.errors.SELF_ILLEGAL);
      }

      if(!game.gActionsQueue[uid]) {
        game.gActionsQueue[uid] = [];
      }

      // В игре Симпатии нельзя выбрать несколько раз одного и того же игрока
      // И выбрать того, кого нет
      if(game.gNextGame == constants.G_SYMPATHY || game.gNextGame == constants.G_SYMPATHY_SHOW) {
         var i, actions = game.gActionsQueue[uid];

         for( i = 0; i < actions.length; i++) {
           if(actions[i]["pick"] == options.pick) { return; }
         }

        if(!game.gActivePlayers[options.pick]) { return; }
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