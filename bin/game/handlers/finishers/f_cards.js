/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const async = require('async');
const logger = require('./../../../../lib/log')(module);

const Config        = require('./../../../../config.json');
const constants     = require('./../../../constants');
const  oPool        = require('./../../../objects_pool');
const  stat         = require('./../../../stat_manager');
const  ProfileJS    = require('./../../../profile/index');

const  addPoints    = require('./../../lib/add_points');

const PF            = constants.PFIELDS;
const CARD_COUNT    = Number(Config.game.card_count);
const CARD_BONUS    = Number(Config.moneys.card_bonus);
const CARD_POINTS   = Number(Config.points.game.gold);

module.exports = function (game) {
  
  game.clearTimer();
  
  stat.setMainStat(constants.SFIELDS.CARDS_ACTIVITY, game.getActivityRating());
  
  // Готовим сведения о выборе игроков и отбираем победителей
  let gold    = Math.floor(Math.random() * CARD_COUNT);
  let winners = [];
  
  let result = {
    [PF.PICKS]  : [],
    [PF.GOLD]   : gold
  };
  
  let players = game.getActivePlayers();
  for(let i = 0; i < players.length(); i++) {
    
    let actions = game.getAction(players[i].id);
  
    if(actions) {
      result[PF.PICKS].push({
        [PF.ID]   : players[i].id,
        [PF.VID]  : players[i].vid,
        [PF.PICK] : actions[0][PF.PICK]
      });
    
      if(actions[0][PF.PICK] == gold) {
        winners.push(players[i]);
      }
    }
  }

  if(winners.length == 0) {
    return game.getHandler(constants.G_START, constants.GT_ST)(game, result, true);
  }
  
  // Определяем, кому начислить бонус
  let lucky;
  let winnersInRoom = [];
  for(let i = 0; i < winners.length; i++) {
    let room = oPool.roomList[winners[i].socketId];
    if(room && game.getRoom().getName() == room.getName()) {
      winnersInRoom.push(winners[i]);
    }
  }
  
  if(winnersInRoom.length > 0) {
    if(winnersInRoom.length > 1) {
      let rand = Math.floor(Math.random() * winnersInRoom.length);
      lucky = winnersInRoom[rand];
    } else {
      lucky = winnersInRoom[0];
    }
  
    let ranks = game._room.getRanks();
    ranks.addRankBall(constants.RANKS.LUCKY, lucky.id);
  }
  
  // Если есть победители, делим награду поровну и добавляем всем монеты
  let bonus = Math.round(CARD_BONUS / winners.length);
  let count   = 0;
  addMoney();
  
  //------------------------
  function addMoney() {
    async.waterfall([ //-------------------------------------------------------
      function(cb) { // Получаем профиль пользователя
        let player = oPool.profiles[winners[count].id];
        
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
        player.earn(bonus, function (err, money) {
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
          
          cb(null, player, money, isOnline);
        })
      } //----------------------------------------------------------
    ], function(err, player, money, isOnline) { // Оповещаем об изменениях
      if(err) {
        logger.error(constants.G_CARDS + ' ' + count.GT_FIN);
        logger.error(err);
        return;
      }
      
      // Сообщяем о начислении монет
      if(isOnline) {
        player.getSocket().emit(constants.IO_GET_MONEY, { [PF.MONEY] : money });
      }
      
      // Повторяем для всех пользователей
      count++;
      if(count < winners.length) {
        addMoney();
      } else {
        game.getHandler(constants.G_START, constants.GT_ST)(game, result, true);
      }
    });//-------------------------------------------------------
  } // addMoney
  
};