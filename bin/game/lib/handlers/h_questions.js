var constants = require('../../constants_game');
var GameError = require('./../../../game_error'),
  checkInput = require('./../../../check_input');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players'),
    setAnswersLimit = require('../set_answers_limits');

// Вопросы, ждем, когда все ответят, потом показываем всем ответы
module.exports = function(game) {
  return function(socket, timer) {
    if(game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      var options = { answers : [] };
      var item, player;
      for (item in game.currPlayers) if(game.currPlayers.hasOwnProperty(item)) {
        player = game.currPlayers[item];
        var answers = game.actionsQueue[player.getID()];

        if(answers) {
          //if (!checkInput('game_questions', game.gSocket, game.userList, answers[0])) {
          //  game.stop();
          //  return new GameError(socket, "GAMEQUESTIONS",
          //    "Неверные агрументы: ответы на вопросы должны быть 1, 2 или 3");
          //}

          options.answers.push({ id : player.getID(), pick : answers[0].pick });
        }

      }

      game.emit(socket, options);

      game.nextGame = 'start';
      game.currPlayers = {};
      game.actionsQueue = {};
      pushAllPlayers(game.gRoom, game.currPlayers);
      setAnswersLimit(game, 1);
      game.countActions = constants.PLAYERS_COUNT;
      game.currTimer = startTimer(game.pSocket, game.handlers[game.nextGame]);
    }
  }
};