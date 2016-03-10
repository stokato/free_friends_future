var constants = require('../../constants_game');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players');

// Симпатии, ждем, когда все ответят и переходим к показу результатов
module.exports = function(game) {
  return function () {
    if (game.countActions == 0) {
      var options = {complete: true};

      game.emit(options);

      game.nextGame = 'sympathy_show';
      game.currPlayers = [];
      pushAllPlayers(game.gRoom, game.currPlayers);
      game.actionsQueue = {};
      game.countActions = constants.PLAYERS_COUNT * constants.PLAYERS_COUNT;
      game.currTimer = startTimer(game.handlers[game.nextGame], game.countActions);
    }
  }
};