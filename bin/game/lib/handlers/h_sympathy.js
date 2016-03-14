var constants = require('../../constants_game');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players'),
    setAnswersLimit = require('../set_answers_limits');

// Симпатии, ждем, когда все ответят и переходим к показу результатов
module.exports = function(game) {
  return function (socket, timer, id) {

    if (game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      var options = {complete: true};

      game.emit(socket, options);

      game.nextGame = 'sympathy_show';
      game.currPlayers = [];
      pushAllPlayers(game.gRoom, game.currPlayers);
      setAnswersLimit(game, constants.PLAYERS_COUNT -1);
      game.storedOptions = game.actionsQueue;
      game.actionsQueue = {};
      game.countActions = constants.PLAYERS_COUNT * (constants.PLAYERS_COUNT -1);

      game.currTimer = startTimer(game.pSocket, game.handlers[game.nextGame]);
    }
  }
};