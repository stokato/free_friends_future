/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Завершаем раунд игры Бутылочка - поцелуи
 * Если поцеловались оба - начисляем очки
 * Ставим игру на паузу
 *
 */

const logger    = require('./../../../../lib/log')(module);
const statCtrlr = require('./../../../stat_controller');
const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');

module.exports = function (game) {
  
  const KISS_POINTS = Number(Config.points.game.mutual_kiss);
  
  game.clearTimer();
  
  statCtrlr.setMainStat(PF.BOTTLE_ACTIVITY, game.getActivityRating());
  
  let isAllKissed = true;
  let playersArr = game.getActivePlayers();
  
  let playersCount = playersArr.length;
  for(let i = 0; i < playersCount; i++) {
    
    let actionsArr = game.getActions(playersArr[i].id);
    if(!actionsArr || Boolean(actionsArr[0][PF.PICK]) == false) {
      isAllKissed = false;
    }
  }
  
  // Если оба поцеловали друг друга, добавляем им очки
  if(isAllKissed) {
    for(let i = 0; i < playersCount; i++) {
      game.addPoints(playersArr[i].id, KISS_POINTS, onComplete(i))
    }
  } else {
    game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_ST)(game, null, true);
  }
  
  //-----------------------------
  function onComplete(count) {
    return function(err) {
      if(err) {
        logger.error(game.CONST.G_BOTTLE_KISSES + ' ' + game.CONST.GT_FIN);
        logger.error(err);
      }
  
      count++;
      if(count < playersArr.length) {
        game.addPoints(playersArr[count].id, KISS_POINTS, onComplete(count));
      } else {
        game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_ST)(game, null, true);
      }
    }
  }
  
};