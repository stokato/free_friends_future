var GameError = require('./../../../game_error');
var constants = require('../../constants');

var startTimer         = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    setActionsLimit    = require('../set_action_limits');

var constants_io = require('../../../io/constants');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, uid, options) {
    var f = constants_io.FIELDS;
    if(uid) {
      if(uid == options[f.pick]) {
        var socket = game.gActivePlayers[uid].setSocket();
        new GameError(game.gActivePlayers[uid].setSocket(),
          constants.G_SYMPATHY, "Нельзя выбирать себя");
        game.stop();

        return socket.broadcast.in(game.gRoom.name).emit(constants_io.IO_ERROR,
          {name: "Игра остановлена всвязи с ошибкой"});
      }

      var sympathy = game.gStoredOptions[options[f.pick]];

      if(sympathy) {
        var result = {}, i;
        result[f.picks] = [];

        for(i = 0; i < sympathy.length; i ++) {
          var pickedId = sympathy[i][f.pick];

          if(!game.gRoom.guys[pickedId] && !game.gRoom.girls[pickedId]) {
            game.stop();
            return new GameError(game.gActivePlayers[uid].getSocket(),
              constants.G_SYMPATHY, "Неверные агрументы: нет игрока с таким ИД");
          }

          var pick = {};
          pick[f.id] = options[f.pick];
          pick[f.pick] = pickedId;
          result[f.picks].push(pick);
        }

        game.emit(game.gActivePlayers[uid].getSocket(), result, uid);
      }
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