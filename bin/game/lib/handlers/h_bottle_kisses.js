var GameError = require('./../../../game_error');
var constants = require('../../../constants');
var profilejs =  require('../../../profile/index');

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
        player = new profilejs();
        player.build(players[count].id, function (err, info) {
          if(err) {
            new GameError(players[count].player.getSocket(),  constants.G_BOTTLE_KISSES, "Ошибка при создании профиля игрока");
            return callback(err, null);
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
          new GameError(player.getSocket(),  constants.G_BOTTLE_KISSES, "Ошибка при начислении очков пользователю");
          return onComplete(err, null);
        }

        var playerSocket = player.getSocket();
        playerSocket.emit(constants.IO_ADD_POINTS, { points : res });

        count++;
        if(count < players.length) {
          addPoints();
        } else {
          onComplete(null, null);
        }
      }
    }

    // После того, как все очки начислены, переходим к следующей игре
    function onComplete(err, res) {
      if(err) { return game.stop(); }

      game.restoreGame(null, true);
    }

  }
};


