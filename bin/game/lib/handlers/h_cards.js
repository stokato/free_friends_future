/**
 * Карты, ждем, кода все ответят, потом показываем ответы и где золото
 *
 * @param timer - признак - запущено таймером, socket, options - объект с выбором игрока
 */

var async = require('async');

var constants     = require('../../../constants'),
    PF            = constants.PFIELDS,
    addAction     = require('./../common/add_action'),
    GameError     = require('./../common/game_error'),
    ProfileJS     = require('../../../profile/index'),
    handleError   = require('../common/handle_error'),
    oPool         = require('./../../../objects_pool');

module.exports = function(game) {
  return function (timer, socket, options) {
  
    // Если вызов произведен игроком, сохраняем его выбор
    if(!timer) {
      var selfProfile = oPool.userList[socket.id];
      var uid         = selfProfile.getID();
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
  
      addAction(game, uid, options);
    }

    //----------------------------------------------------------------------------
    // Если ходы закончились или изтек таймаут
    if (game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      // Если игроков недостаточно - останавливаем игру
      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      // Готовим сведения о выборе игорков и отбираем победителей
      var gold    = Math.floor(Math.random() * constants.CARD_COUNT);
      var winners = [];
      var count   = 0;
      var bonus   = constants.CARD_BOUNUS;

      var result = {};
      result[PF.PICKS]  = [];
      result[PF.GOLD]   = gold;

      var item, playerInfo, picks;
      for (item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {

        playerInfo = game._activePlayers[item];
        picks = game._actionsQueue[playerInfo.id];

        if(picks) {
          var pick = {};
          pick[PF.ID]   = playerInfo.id;
          pick[PF.VID]  = playerInfo.vid;
          pick[PF.PICK] = picks[0][PF.PICK];
          
          result[PF.PICKS].push(pick);

          if(picks[0][PF.PICK] == gold) {
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
        async.waterfall([ //-------------------------------------------------------
          function(cb) { // Получаем профиль пользователя
            var player = oPool.userList[winners[count].socketId];

            if(player) {
              cb(null, player, true);
            } else {
              player = new ProfileJS();
              player.build(winners[count].id, function (err) {
                if(err) {
                  return cb(err, null);
                }

                cb(null, player, false);
              });
            }
          },//-------------------------------------------------------
          function(player, isOnline, cb) { // Получаем баланс
            player.getMoney(function (err, money) {
              if (err) {  cb(err, null); }

              var newMoney = money + bonus;
              cb(null, player, newMoney, isOnline);
            });
          },//-------------------------------------------------------
          function(player, newMoney, isOnline, cb) { // Добавляем монет
            player.setMoney(newMoney, function (err, money) {
              if (err) {  cb(err, null); }

              cb(null, player, money, isOnline);
            });

          }//-------------------------------------------------------
        ], function(err, player, money, isOnline) { // Оповещаем об изменениях
          if(err) { return new GameError(constants.G_CARDS, err.message);
            
            if(isOnline) {
              handleError(player.getSocket(), constants.IO_GAME_ERROR, constants.G_CARDS, err);
            }
            return;
          }

          // Сообщяем о начислении моент
          if(isOnline) {
            var res = {};
            res[PF.MONEY] = money;
            
            player.getSocket().emit(constants.IO_GET_MONEY, res);
          }

          // Повторяем для всех пользователей
          count++;
          if(count < winners.length) {
            addMoney();
          } else {
            game.restoreGame(result, true);
          }
        });//-------------------------------------------------------
      } // addMoney
    }
  }
};
