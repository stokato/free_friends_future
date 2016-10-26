var GameError = require('./../../../game_error');
var constants = require('../../../constants');
var ProfileJS =  require('../../../profile/index');
var handleError = require('../../../handle_error');

// Бутылочка поцелуи, сообщаем всем выбор пары
module.exports = function(game) {
  return function (timer, uid, options) {

    if(uid) { // Отправляем всем выбор игрока
      broadcastPick(uid);
    }

    var count = 0, players = [];

    // Если все игроки сделали выбор, проверяем - оба ли поцеловали
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      var playerInfo, item, allKissed = true;
      for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        playerInfo  = game.gActivePlayers[item];
        if(!game.gActionsQueue[playerInfo.id] || !game.gActionsQueue[playerInfo.id][0].pick === true) {
          allKissed = false;
        }
      }

      // Если оба поцеловали друг друга, нужно добавить им очки, получаем данные игроков
      if(allKissed) {
        for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
          players.push(game.gActivePlayers[item]);
        }
        addPoints();
      } else {
        game.restoreGame(null, true);
      }
    }

    //----------------
    function broadcastPick(uid) {
      var playerInfo = game.gActivePlayers[uid];

      var result = {
        id   : uid,
        vid  : playerInfo.vid,
        pick : options.pick
      };
      game.emit(result);

      if(!game.gameState.picks) { game.gameState.picks = []; }
      game.gameState.picks.push(result);
    }


    // Функция проверяет, если игрок не онлайн, создает его профиль.
    // Добавляет всем очки
    function addPoints() {
      var player = game.userList[players[count].socketId];
      if(player) {
        player.addPoints(constants.KISS_POINTS, onPoints(player));
      } else {
        player = new ProfileJS();
        player.build(players[count].id, function (err, info) {
          if(err) {
            //new GameError(constants.G_BOTTLE_KISSES, "Ошибка при создании профиля игрока");
            return onComplete(err, player);// callback(err, null);
          }

          player.addPoints(constants.KISS_POINTS, onPoints(player));
        });
      }
    }

    // Функция обрабатывает результы начисления очков, оповещает игрока
    // Если есть еще игрок, вызвает начисления очков для него
    function onPoints(player) {
      return function(err, res) {
        if(err) {
          //new GameError(constants.G_BOTTLE_KISSES, "Ошибка при начислении очков пользователю");
          return onComplete(err, player);
        }

        var playerSocket = player.getSocket();
        playerSocket.emit(constants.IO_ADD_POINTS, { points : res });

        count++;
        if(count < players.length) {
          addPoints();
        } else {
          onComplete(null, player);
        }
      }
    }

    // После того, как все очки начислены, переходим к следующей игре
    function onComplete(err, player) {
      if(err) {
        // return game.stop();
        var socket = player.getSocket();
        
        if(socket) {
          return handleError(socket, constants.IO_GAME_ERROR, err);
        }
        
        return new GameError(constants.G_BOTTLE_KISSES, err.message);
      }

      game.restoreGame(null, true);
    }

  }
};


