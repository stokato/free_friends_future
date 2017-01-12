/**
 * Карты, ждем, кода все ответят, потом показываем ответы и где золото
 *
 * @param timer - признак - запущено таймером, socket, options - объект с выбором игрока
 */

const async = require('async');

const Config        = require('./../../../config.json');
const constants     = require('../../constants'),
    PF            = constants.PFIELDS,
    addAction     = require('./../lib/common/add_action'),
    GameError     = require('./../lib/common/game_error'),
    ProfileJS     = require('../../profile/index'),
    handleError   = require('../lib/common/handle_error'),
    oPool         = require('./../../objects_pool'),
    stat          = require('./../../stat_manager'),
    addPoints     = require('./../lib/common/add_points');

const CARD_COUNT = Number(Config.game.card_count);
const CARD_BONUS = Number(Config.moneys.card_bonus);
const CARD_POINTS = Number(Config.points.game.gold);

module.exports = function(game) {
  return function (timer, socket, options) {
  
    // Если вызов произведен игроком, сохраняем его выбор
    if(!timer) {
      let selfProfile = oPool.userList[socket.id];
      let uid         = selfProfile.getID();
  
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
      // if(!game.checkCountPlayers()) {
      //   return game.stop();
      // }

      // Готовим сведения о выборе игорков и отбираем победителей
      let gold    = Math.floor(Math.random() * CARD_COUNT);
      let winners = [];
      let count   = 0;
      let bonus   = CARD_BONUS;

      let result = {};
      result[PF.PICKS]  = [];
      result[PF.GOLD]   = gold;

      let item, playerInfo, picks;
      for (item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {

        playerInfo = game._activePlayers[item];
        picks = game._actionsQueue[playerInfo.id];

        if(picks) {
          let pick = {};
          pick[PF.ID]   = playerInfo.id;
          pick[PF.VID]  = playerInfo.vid;
          pick[PF.PICK] = picks[0][PF.PICK];
          
          result[PF.PICKS].push(pick);

          if(picks[0][PF.PICK] == gold) {
            winners.push(playerInfo);
          }
        }
      }
      
      stat.setMainStat(constants.SFIELDS.CARDS_ACTIVITY, game.getActivityRating());

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
            let player = oPool.userList[winners[count].socketId];

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

              let newMoney = money + bonus;
              cb(null, player, newMoney, isOnline);
            });
          },//-------------------------------------------------------
          function(player, newMoney, isOnline, cb) { // Добавляем монет
            player.setMoney(newMoney, function (err, money) {
              if (err) {  cb(err, null); }
              
              // Статистика
              stat.setUserStat(player.getID(), player.getVID(), constants.SFIELDS.COINS_EARNED, bonus);
              stat.setMainStat(constants.SFIELDS.COINS_EARNED, bonus);

              cb(null, player, money, isOnline);
            });

          },//-------------------------------------------------------
          function (player, money, isOnline, cb) {
            addPoints(player.getID(), CARD_POINTS, function (err, points) {
              if (err) {  cb(err, null); }
              
              // if(isOnline) {
              //   let res = {};
              //   res[constants.PFIELDS.POINTS] = points;
              //
              //   player.getSocket().emit(constants.IO_ADD_POINTS, res);
              // }
  
              cb(null, player, money, isOnline);
            })
          } //----------------------------------------------------------
        ], function(err, player, money, isOnline) { // Оповещаем об изменениях
          if(err) { return new GameError(constants.G_CARDS, err.message);
            
            if(isOnline) {
              handleError(player.getSocket(), constants.IO_GAME_ERROR, constants.G_CARDS, err);}
            return;
          }

          // Сообщяем о начислении моент
          if(isOnline) {
            let res = {};
            res[PF.MONEY] = money;
            player.getSocket().emit(constants.IO_GET_MONEY, res);
  
            // Возможно достижение нужного количества баллов несколькими игроками
            let ranks = game._room.getRanks();
            ranks.addRankBall(constants.RANKS.LUCKY, player.getID());
  
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
