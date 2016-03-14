var GameError = require('./../../../game_error'),
  checkInput = require('./../../../check_input');
var constants = require('../../constants_game');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players'),
    setAnswersLimit = require('../set_answers_limits');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(socket, timer, id, options) {
    if(id) {
      var sympathy = game.storedOptions[options.pick];
      var result = { sympathy: []}, i;

      for(i = 0; i < sympathy.length; i ++) {
        var uid = sympathy[i].pick;

        //if (!checkInput('game_sympathy', game.currPlayers[id].getSocket(), game.userList, options)) {
        //  game.stop();
        //  return new GameError(game.currPlayers[id].getSocket(), "GAMESYMPATHY",
        //    "Неверные агрументы: в качестве ответа должен быть указан ИД игрока");
        //}

        if(!game.gRoom.guys[uid] && !game.gRoom.girls[uid]) {
          game.stop();
          return new GameError(game.currPlayers[id].getSocket(), 'GAMESYMPATHY', "Неверные агрументы: нет игрока с таким ИД");
        }

        result.sympathy.push({id : options.pick, sympathy : uid})
      }

      game.emit(socket, result, id);
    }

    if(game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      game.nextGame = 'start';
      game.currPlayers = {};
      pushAllPlayers(game.gRoom, game.currPlayers);
      setAnswersLimit(game, 1);
      game.actionsQueue = {};
      game.storedOptions = {};
      game.countActions = constants.PLAYERS_COUNT;

      game.currTimer = startTimer(game.pSocket, game.handlers[game.nextGame]);
    }
  }
};