/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Завершаем первый этап раунда Симпатии
 * Выбравшим друг друга игрокам начилсяем очки
 * Сохраняем их выбор
 * Переходим к следующему этапу
 *
 */

const logger    = require('./../../../../lib/log')(module);
const statCtrlr = require('./../../../stat_manager');
const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');

module.exports = function (game) {
  
  const MUTUAL_SYMPATHY_BONUS = Number(Config.points.game.mutual_sympathy);
  
  game.clearTimer();
  
  statCtrlr.setMainStat(PF.SYMPATHY_ACITVITY, game.getActivityRating());
  
  let playersArr = game.getActivePlayers();
  let playersCount = playersArr.length;
  let mutualsArr = [];
  
  for(let i = 0; i < playersCount; i++) {
    let actionsArr = game.getActions(playersArr[i].id);
    
    // Первый игрок ходил
    if(actionsArr) {
      let actionsCount = actionsArr.length;
      
      for(let a = 0; a < actionsCount; a++) {
        let selfPick = actionsArr[a][PF.PICK];
        
        let otherActionsArr = game.getActions(selfPick);
        // Другой тоже ходил
        if(otherActionsArr) {
          let otherActionsCount = otherActionsArr.length;
          
          for(let o = 0; o < otherActionsCount; o++) {
            let otherPick = otherActionsArr[o][PF.PICK];
            
            // Они выбрали друг друга
            if(otherPick == playersArr[i].id) {
              mutualsArr.push(playersArr[i].id);
            }
          }
        }
      }
    }
  }
  
  if(mutualsArr.length > 0) {
    let count = 0;
    game.addPoints(mutualsArr[count], MUTUAL_SYMPATHY_BONUS, onComplete(mutualsArr, count));
  }
  
  // Сохраняем выбор игроков
  game.saveActionsQueue();
  
  game.getHandler(game.CONST.G_SYMPATHY_SHOW, game.CONST.GT_ST)(game);
  
  //-------------------------------------
  function onComplete (mutualsArr, count) {
    return function (err) {
      if (err) {
        logger.error(game.CONST.G_SYMPATHY + ' ' + game.CONST.GT_FIN);
        logger.error(err);
      }
    
      count++;
      if (count < mutualsArr.length) {
        game.addPoints(mutualsArr[count], MUTUAL_SYMPATHY_BONUS, onComplete(mutualsArr, count));
      }
    }
  }
};