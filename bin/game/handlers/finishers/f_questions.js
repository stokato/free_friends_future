/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Выдаем результаты выбора игаков
 * Ставим игру на паузу
 */

const PF        = require('./../../../const_fields');
const statCtrlr = require('./../../../stat_manager');

module.exports = function (game) {
  
  game.clearTimer();
  
  let resultObj = { [PF.PICKS] : [] };
  
  let playersArr = game.getActivePlayers();
  let playersCount = playersArr.length;
  
  for(let i = 0; i < playersCount; i++) {
    let actionsArr = game.getActions(playersArr[i].id);
    
    if(actionsArr) {
      resultObj[PF.PICKS].push({
        [PF.ID]   : playersArr[i].id,
        [PF.VID]  : playersArr[i].vid,
        [PF.PICK] : actionsArr[0][PF.PICK]
      });
    }
  }
  
  statCtrlr.setMainStat(PF.QUESTION_ACITVITY, game.getActivityRating());
  
  game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_ST)(game, resultObj, true);
};