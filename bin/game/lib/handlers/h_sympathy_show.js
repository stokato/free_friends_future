var GameError = require('./../../../game_error');
var constants = require('../../constants');

var randomPlayer = require('../random_player');
//,
//    startTimer         = require('../start_timer'),
//    activateAllPlayers = require('../activate_all_players'),
//    setActionsLimit    = require('../set_action_limits'),
//  getPlayersID = require('../get_players_id');

var constants_io = require('../../../io/constants');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, uid, options) {
    var f = constants_io.FIELDS;

    // Есил обработчик вызван игроком а не таймером
    if(uid) {
      if(uid == options[f.pick]) {
        //var socket = game.gActivePlayers[uid].setSocket();
        new GameError(game.gActivePlayers[uid].setSocket(),
          constants.G_SYMPATHY, "Попытка выбрать себя");
        //game.stop();

        //return socket.broadcast.in(game.gRoom.name).emit(constants_io.IO_ERROR,
         // {name: "Игра остановлена всвязи с ошибкой"});

        return;
      }

      // Получаем данные интересуемого игрока
      var sympathy = game.gStoredOptions[options[f.pick]];
      var result = {}, i;

      // Получаем все его ходы и отправляем
      if(sympathy) {
        result = {};
        result[f.picks] = [];
        //result[f.game] = constants.G_SYMPATHY_SHOW;

        for(i = 0; i < sympathy.length; i ++) {
          var pickedId = sympathy[i][f.pick];

          // Есил в комнате нет такого игрока
          //if(!game.gRoom.guys[pickedId] && !game.gRoom.girls[pickedId]) {
          //  //game.stop();
          //  //return new GameError(game.gActivePlayers[uid].getSocket(),
          //  //  constants.G_SYMPATHY, "Неверные агрументы: нет игрока с таким ИД");
          //  continue;
          //}

          var pick = {};
          pick[f.id] = options[f.pick];
          pick[f.vid] = game.gActivePlayers[options[f.pick]].vid;
          pick[f.pick] = {id: pickedId, vid: game.gActivePlayers[pickedId].vid};
          result[f.picks].push(pick);
        }

        game.emit(game.gActivePlayers[uid].player.getSocket(), result, uid);
      }
    }

    // После истечения времени на просмотр чужих симпатий переходим к следующему раунду
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      //game.gNextGame = constants.G_LOT;
      //
      //game.gActivePlayers = {};
      //game.gActionsQueue = {};
      //game.gStoredOptions = {};
      //
      //activateAllPlayers(game.gRoom, game.gActivePlayers);
      //
      //setActionsLimit(game, 1);
      //game.gActionsCount = constants.PLAYERS_COUNT;

      //result = {};
      //result[f.next_game] = game.gNextGame;
      ////result[f.players] = getPlayersID(game.gActivePlayers);
      //
      //var nextPlayer = randomPlayer(game.gRoom, null);
      //result[f.players] = [{id: nextPlayer.getID(), vid: nextPlayer.getVID()}];
      //
      //
      //var item, player;
      //for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
      //  player = game.gActivePlayers[item];
      //  break;
      //}
      //
      //game.emit(player.getSocket(), result);
      //game.gameState = result;

      game.restoreGame();

      //game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};