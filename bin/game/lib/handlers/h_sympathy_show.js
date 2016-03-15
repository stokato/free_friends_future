var GameError = require('./../../../game_error');
var constants = require('../../constants');

var startTimer         = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    setActionsLimit    = require('../set_action_limits');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, uid, options) {
    if(uid) {
      var sympathy = game.gStoredOptions[options.pick];

      var result = { picks: [] }, i;

      for(i = 0; i < sympathy.length; i ++) {
        var pickedId = sympathy[i].pick;

        if(!game.gRoom.guys[pickedId] && !game.gRoom.girls[pickedId]) {
          game.stop();
          return new GameError(game.gActivePlayers[uid].getSocket(),
                      'GAMESYMPATHY', "Неверные агрументы: нет игрока с таким ИД");
        }

        result.picks.push({ id : options.pick, pick : pickedId })
      }

      game.emit(game.gActivePlayers[uid].getSocket(), result, uid);
    }

    if(game.gActionsCount == 0 || timer) { // После истечения времени на просмотр чужих симпатий
      if(!timer) { clearTimeout(game.gTimer); }

      game.gNextGame = constants.G_START;

      game.gActivePlayers = {};
      game.gActionsQueue = {};
      game.gStoredOptions = {};

      activateAllPlayers(game.gRoom, game.gActivePlayers);

      setActionsLimit(game, 1);
      game.gActionsCount = constants.PLAYERS_COUNT;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};