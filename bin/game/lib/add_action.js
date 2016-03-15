var GameError = require('./../../game_error'),
    checkInput = require('./../../check_input');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, userList) {
  socket.on('game', function(options) {
    var selfProfile = userList[socket.id];
    var uid = selfProfile.getID(),
        game = selfProfile.getGame();

    if(game.gActivePlayers[uid] && game.gActionsLimits[uid] > 0) {

      if (!checkInput(game.gNextGame, socket, userList, options)) {
        game.stop();
        socket.broadcast.in(game.gRoom.name).emit("err",
          {name: "Игра остановлена всвязи с ошибкой"});

        return new GameError(socket, "GAME", "Верификация не пройдена");
      }

      if(!game.gActionsQueue[uid]) {
        game.gActionsQueue[uid] = [];
      }

      if(game.gNextGame != 'picks' || game.gNextGame != 'sympathy_show') {
         var i, actions = game.gActionsQueue[uid];

         for( i = 0; i < actions.length; i++) {
           if(actions[i].pick == options.pick) { return; }
         }
      }

      game.gActionsLimits[uid] --;

      game.gActionsQueue[uid].push(options);
      game.gActionsCount--;

      game.gHandlers[game.gNextGame](false, uid, options);
    }
  });
};