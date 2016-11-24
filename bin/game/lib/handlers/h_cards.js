var async = require('async');

var constants = require('../../../constants');
var GameError = require('./../common/game_error');
var ProfileJS  =  require('../../../profile/index');
var handleError = require('../common/handle_error');
var oPool = require('./../../../objects_pool');


// Карты, ждем, кода все ответят, потом показываем ответы и где золото
module.exports = function(game) {
  return function (timer) {

    if (game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      var gold = Math.floor(Math.random() * constants.CARD_COUNT);
      var winners = [];
      var count = 0;
      var bonus = constants.CARD_BOUNUS;

      var result = {
        picks : [],
        gold  : gold
      };

      var item, playerInfo, picks;
      for (item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {

        playerInfo = game._activePlayers[item];
        picks = game._actionsQueue[playerInfo.id];

        if(picks) {
          result.picks.push({
            id   : playerInfo.id,
            vid  : playerInfo.vid,
            pick : picks[0].pick
          });

          if(picks[0].pick == gold) {
            winners.push(playerInfo);
          }
        }
      }

      // Если есть победители, делим награду поровну и добавляем всем монеты
      if(winners.length > 0) {
        bonus = Math.round(bonus / winners.length);
        addMoney();
      } else {
        game.restoreGame(result, true);
      }

      // Функция проверяет, если игрок не онлайн, создает его профиль.
      // Добавляет всем монеты
      function addMoney() {
        async.waterfall([ ///////////////////////////////////////////////////////////////
          function(cb) { // Получаем профиль пользователя
            var player = oPool.userList[winners[count].socketId];

            if(player) {
              cb(null, player, true);
            } else {
              player = new ProfileJS();
              player.build(winners[count].id, function (err, info) {
                if(err) {
                  //new GameError(winners[count].player.getSocket(),  constants.G_CARDS, "Ошибка при создании профиля игрока");
                  return cb(err, null);
                }

                cb(null, player, false);
              });
            }
          },/////////////////////////////////////////////////////////////////////////////
          function(player, isOnline, cb) { // Получаем баланс
            player.getMoney(function (err, money) {
              if (err) {  cb(err, null); }

              var newMoney = money + bonus;
              cb(null, player, newMoney, isOnline);
            });
          },////////////////////////////////////////////////////////////////////////
          function(player, newMoney, isOnline, cb) { // Добавляем монет
            player.setMoney(newMoney, function (err, money) {
              if (err) {  cb(err, null); }

              cb(null, player, money, isOnline);
            });

          }////////////////////////////////////////////////////////////////////
        ], function(err, player, money, isOnline) { // Оповещаем об изменениях
          if(err) {
            //new GameError(player.getSocket(),  constants.G_CARDS, "Ошибка при начислении монет пользователю");
            // return  game.stop();
            new GameError(constants.G_CARDS, err.message);
            
            if(isOnline) {
              handleError(player.getSocket(), constants.IO_GAME_ERROR, err);
            }
            return;
          }

          if(isOnline) {
            player.getSocket().emit(constants.IO_GET_MONEY, { money : money });
          }

          // Повторяем для всех пользователей
          count++;
          if(count < winners.length) {
            addMoney();
          } else {
            game.restoreGame(result, true);
          }
        });///////////////////////////////////////////////////////
      } // addMoney

    }
  }
};
