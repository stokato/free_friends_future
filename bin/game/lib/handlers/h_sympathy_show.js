var GameError = require('./../../../game_error'),
  checkInput = require('./../../../check_input');
var constants = require('../../constants_game');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, id, options) {
    if(!game.currPlayers[id]['showsSympathy']) {
      game.currPlayers[id]['showsSympathy'] = 0;
    }
    game.currPlayers[id]['showsSympathy'] += 1;

    if(!game.currPlayers[id]['showsSympathy'] > constants.SHOW_SYMPATHY_LIMIT) {
      var sympathy = game.oldActionsQueue[options.id];
      var result = { sympathy: []}, i;

      for(i = 0; i < sympathy.length; i ++) {
        var uid = sympathy[i].pick;

        if (!checkInput('game_sympathy', game.gSocket, game.userList, options)) {
          game.stop();
          return new GameError(socket, "GAMESYMPATHY",
                            "Неверные агрументы: в качестве ответа должен быть указан ИД игрока");
        }

        if(!game.gRoom.guys[uid] && !game.gRoom.girls[uid]) {
          game.stop();
          return new GameError(game.gSocket, 'GAMESYMPATHY', "Неверные агрументы: нет игрока с таким ИД");
        }

        result.sympathy.push({id : id, sympathy : uid})
      }

      game.emit(result, id);
    }


    if(game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      game.nextGame = 'start';
      game.currPlayers = {};
      pushAllPlayers(game.gRoom, game.currPlayers);
      game.actionsQueue = {};
      game.oldActionsQueue = {};
      game.countActions = constants.PLAYERS_COUNT;

      game.currTimer = startTimer(game.handlers[game.nextGame]);
    }
  }
};