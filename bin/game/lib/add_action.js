var GameError = require('./../../game_error'),
    checkInput = require('./../../check_input');

// Добавить ход игрока в очередь для обработки
module.exports = function (game, socket) {
  socket.on('action', function(options) {
    var profile = game.userList[socket.id];
    var id = profile.getID();

    if (!checkInput(game.nextGame, profile.getSocket(), game.userList, options)) {
      game.stop();
      return new GameError(profile.getSocket(), "GAME", "Верификация не пройдена");
    }

    if(game.currPlayers[id] && game.answersLimits[id] > 0) {
      if(!game.actionsQueue[id]) {
        game.actionsQueue[id] = [];
      }
      if(game.nextGame != 'sympathy' || game.nextGame != 'sympathy_show') {
         var i, actions = game.actionsQueue[profile.getID()];
         for( i = 0; i < actions.length; i++) {
           if(actions[i].pick == options.pick) { return }
         }
      }
        game.answersLimits[id] --;

        game.actionsQueue[profile.getID()].push(options);
        game.countActions--;



      game.handlers[game.nextGame](socket, false, profile.getID(), options);
    }
  });
};