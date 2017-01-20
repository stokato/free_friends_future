/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Завершаем раунд Карты
 * Определяем - какая карта выигрешная
 * Начисляем победителям монеты и очки
 * Ставим игру на паузу
 *
 */

const async = require('async');
const logger = require('./../../../../lib/log')(module);

const Config     = require('./../../../../config.json');
const PF         = require('./../../../const_fields');
const oPool      = require('./../../../objects_pool');
const statCtrlr  = require('./../../../stat_manager');
const ProfileJS  = require('./../../../profile/index');

module.exports = function (game) {
  
  const CARD_COUNT    = Number(Config.game.card_count);
  const CARD_BONUS    = Number(Config.moneys.card_bonus);
  const CARD_POINTS   = Number(Config.points.game.gold);
  const LUCKY_RANK    = Config.ranks.lucky.name;
  
  game.clearTimer();
  
  statCtrlr.setMainStat(PF.CARDS_ACTIVITY, game.getActivityRating());
  
  // Готовим сведения о выборе игроков и отбираем победителей
  let goldNum    = Math.floor(Math.random() * CARD_COUNT);
  let winnersArr = [];
  
  let resultObj = {
    [PF.PICKS]  : [],
    [PF.GOLD]   : goldNum
  };
  
  let playersArr = game.getActivePlayers();
  let playersLen = playersArr.length;
  
  for(let i = 0; i < playersLen; i++) {
    
    let actionsArr = game.getActions(playersArr[i].id);
  
    if(actionsArr) {
      resultObj[PF.PICKS].push({
        [PF.ID]   : playersArr[i].id,
        [PF.VID]  : playersArr[i].vid,
        [PF.PICK] : actionsArr[0][PF.PICK]
      });
    
      if(actionsArr[0][PF.PICK] == goldNum) {
        winnersArr.push(playersArr[i]);
      }
    }
  }

  if(winnersArr.length == 0) {
    return game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_ST)(game, resultObj, true);
  }
  
  // Определяем, кому начислить бонус
  let luckyObj;
  let winnersInRoomArr = [];
  let winnersCount = winnersArr.length;
  
  for(let i = 0; i < winnersCount; i++) {
    let room = oPool.roomList[winnersArr[i].socketId];
    if(room && game.getRoom().getName() == room.getName()) {
      winnersInRoomArr.push(winnersArr[i]);
    }
  }
  
  if(winnersInRoomArr.length > 0) {
    if(winnersInRoomArr.length > 1) {
      let randWinner = Math.floor(Math.random() * winnersInRoomArr.length);
      luckyObj = winnersInRoomArr[randWinner];
    } else {
      luckyObj = winnersInRoomArr[0];
    }
  
    let ranksCtrlr = game.getRoom().getRanks();
    ranksCtrlr.addRankBall(LUCKY_RANK, luckyObj.id);
  }
  
  // Если есть победители, делим награду поровну и добавляем всем монеты
  let bonus = Math.round(CARD_BONUS / winnersArr.length);
  let count   = 0;
  addMoney();
  
  //------------------------
  function addMoney() {
    async.waterfall([ //-------------------------------------------------------
      function(cb) { // Получаем профиль пользователя
        let playerProfile = oPool.profiles[winnersArr[count].id];
        
        if(playerProfile) {
          cb(null, playerProfile, true);
        } else {
          playerProfile = new ProfileJS();
          playerProfile.build(winnersArr[count].id, (err) => {
            if(err) {
              return cb(err, null);
            }
            
            cb(null, playerProfile, false);
          });
        }
      },//-------------------------------------------------------
      function(playerProfile, isOnline, cb) { // Получаем баланс
        playerProfile.earn(bonus, (err, money) => {
          if (err) {
            cb(err, null);
          }
  
          // Статистика
          statCtrlr.setUserStat(playerProfile.getID(), playerProfile.getVID(), PF.COINS_EARNED, bonus);
          statCtrlr.setMainStat(PF.COINS_EARNED, bonus);
          
          cb(null, playerProfile, money, isOnline);
        });
      },//-------------------------------------------------------
      function (playerProfile, money, isOnline, cb) {
        game.addPoints(playerProfile.getID(), CARD_POINTS, (err, points) => {
          if (err) {
            cb(err, null);
          }
          
          cb(null, playerProfile, money, isOnline);
        })
      } //----------------------------------------------------------
    ], function(err, playerProfile, money, isOnline) { // Оповещаем об изменениях
      if(err) {
        logger.error(game.CONST.G_CARDS + ' ' + count.GT_FIN);
        logger.error(err);
        return;
      }
      
      // Сообщяем о начислении монет
      if(isOnline) {
        playerProfile.getSocket().emit(Config.io.emits.IO_GET_MONEY, { [PF.MONEY] : money });
      }
      
      // Повторяем для всех пользователей
      count++;
      if(count < winnersArr.length) {
        addMoney();
      } else {
        game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_ST)(game, resultObj, true);
      }
    });//-------------------------------------------------------
  } // addMoney
  
};