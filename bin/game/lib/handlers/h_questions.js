var constants = require('../../constants_game');
var GameError = require('./../../../game_error'),
  checkInput = require('./../../../check_input');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players');

// Вопросы, ждем, когда все ответят, потом показываем всем ответы
module.exports = function(game) {
  return function(timer) {
    if(game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      var options = { answers : [] };
      var item, player;
      for (item in game.currPlayers) if(game.currPlayers.hasOwnProperty(item)) {
        player = game.currPlayers[item];
        var answers = game.actionsQueue[player.getID()];

        if (!checkInput('game_questions', game.gSocket, game.userList, answers[0])) {
          game.stop();
          return new GameError(socket, "GAMEQUESTIONS",
                        "Неверные агрументы: ответы на вопросы должны быть 1, 2 или 3");
        }

        options.answers.push({ id : player.getID(), pick : answers[0] });
      }
      game.emit(options);

      game.nextGame = 'start';
      game.currPlayers = {};
      game.actionsQueue = {};
      pushAllPlayers(game.gRoom, currPlayers);
      game.countActions = constants.PLAYERS_COUNT;
      game.currTimer = startTimer(game.handlers[game.nextGame]);
    }
  }
};