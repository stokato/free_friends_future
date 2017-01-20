/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Выдаем результаты игры Кто больше нравится,
 * Проверяем - если кто-то выбран лучшим - начисляем ему очки
 * Ставим игру на паузу
 *
 */

const statCtrlr    = require('./../../../stat_manager');
const Config       = require('./../../../../config.json');
const PF           = require('./../../../const_fields');

const  emitRes     = require('./../../../emit_result');

module.exports = function (game) {
  
  const BEST_POINTS  = Number(Config.points.game.best);
  
  game.clearTimer();
  
  statCtrlr.setMainStat(PF.BEST_ACTIVITY, game.getActivityRating());
  
  // Если кто-то голосовал - показываем результаты, либо сразу переходим к волчку
  if(game.getActionsCount() != game.getActionsMain()) {
    
    // Проверяем - кто выбран лучшим
    let bestsObj    = game.getStoredOptions();
    let playersArr  = game.getActivePlayers();
    
    let theBestObj = { id: null, count : 0 };
    
    let playersCount = playersArr.length;
    for (let i = 0; i < playersCount; i++) {
      let actionsArr = game.getActions(playersArr[i].id);
      
      if(actionsArr && actionsArr[0] && bestsObj[actionsArr[0][PF.PICK]]) {
        let bestObj = bestsObj[actionsArr[0][PF.PICK]];
        bestObj.count = bestObj.count + 1 || 1;
  
        if(bestObj.count > theBestObj.count) {
          theBestObj.id = bestObj[PF.ID];
          theBestObj.vid = bestObj[PF.VID];
          theBestObj.count = bestObj.count;
          
        } else if(bestObj.count == theBestObj.count) {
          theBestObj.id = null;
          theBestObj.vid = null;
        }
      }
      
    }
    
    // Если есть победитель - начисляем ему очки
    if(theBestObj.id) {
      statCtrlr.setUserStat(theBestObj.id, theBestObj.vid, PF.BEST_SELECTED, 1);
      
      game.addPoints(theBestObj.id, BEST_POINTS, (err) => {
        if(err) {
          let socket = game.getRoom().getAnySocket();
          return emitRes(err, socket, Config.io.emits.IO_GAME_ERROR);
        }
      });
    }
    game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_ST)(game, null, true);
  } else {
    game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_ST)(game, null, false);
  }
};
