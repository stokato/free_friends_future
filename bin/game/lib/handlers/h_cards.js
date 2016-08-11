var constants = require('../../../constants');

// Карты, ждем, кода все ответят, потом показываем ответы и где золото
module.exports = function(game) {
  return function (timer) {

    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      var gold = Math.floor(Math.random() * constants.CARD_COUNT);
      var winners = [];
      var count = 0;

      var result = {
        picks : [],
        gold  : gold
      };

      var item, playerInfo, picks;
      for (item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {

        playerInfo = game.gActivePlayers[item];
        picks = game.gActionsQueue[playerInfo.id];

        if(picks) {
          result.picks.push({
            id   : playerInfo.id,
            vid  : playerInfo.vid,
            pick : picks[0].pick
          });

          if(picks[0].pick == gold) {
            winners.push(playerInfo.id);
          }
        }
      }

      if(winners.length > 0) {
        addMoney();
      } else {
        game.restoreGame(result, true);
      }

      // Функция проверяет, если игрок не онлайн, создает его профиль.
      // Добавляет всем очки
      function addMoney() {
        var player = game.userList[winners[count].socketId];
        if(player) {
          player.addMoney(constants.KISS_POINTS, onMoney(player));
        } else {
          player = new profilejs();
          player.build(players[count].id, function (err, info) {
            if(err) {
              new GameError(players[count].player.getSocket(),  constants.G_BOTTLE_KISSES, "Ошибка при создании профиля игрока");
              return callback(err, null);
            }

            player.addMoney(constants.KISS_POINTS, onMoney(player));
          });
        }
      }

      // Функция обрабатывает результы начисления очков, оповещает игрока
      // Если есть еще игрок, вызвает начисления очков для него
      function onMoney(player) {
        return function(err, res) {
          if(err) {
            new GameError(player.getSocket(),  constants.G_BOTTLE_KISSES, "Ошибка при начислении очков пользователю");
            return onComplete(err, null);
          }

          var playerSocket = player.getSocket();
          playerSocket.emit(constants.IO_ADD_POINTS, { points : res });

          count++;
          if(count < players.length) {
            addMoney();
          } else {
            onComplete(null, null);
          }
        }
      }

      // После того, как все очки начислены, переходим к следующей игре
      function onComplete(err, res) {
        if(err) { return game.stop(); }

        game.restoreGame(result, true);
      }
    }
  }
};
