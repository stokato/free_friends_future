var GameError = require('./../../game_error'),
    checkInput = require('./../../check_input');
var constants_io = require('../../io/constants');
var constants = require('../constants');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, userList) {
  socket.on(constants_io.IO_GAME, function(options) {
    var f = constants_io.FIELDS;
    var selfProfile = userList[socket.id];
    var uid = selfProfile.getID(),
        game = selfProfile.getGame();

    if(game.gActivePlayers[uid] && game.gActionsLimits[uid] > 0) {

      if (!checkInput(game.gNextGame, socket, userList, options)) {
        game.stop();
        socket.broadcast.in(game.gRoom.name).emit(constants_io.IO_ERROR,
          {name: "Игра остановлена всвязи с ошибкой"});

        return new GameError(socket, constants_io.IO_GAME, "Верификация не пройдена");
      }

      if(!game.gActionsQueue[uid]) {
        game.gActionsQueue[uid] = [];
      }

      if(game.gNextGame != constants.G_SYMPATHY || game.gNextGame != constants.G_SYMPATHY_SHOW) {
         var i, actions = game.gActionsQueue[uid];

         for( i = 0; i < actions.length; i++) {
           if(actions[i][f.pick] == options[f.pick]) { return; }
         }
      }

      game.gActionsLimits[uid] --;

      game.gActionsQueue[uid].push(options);
      game.gActionsCount--;

      game.gHandlers[game.gNextGame](false, uid, options);
    }
  });
};