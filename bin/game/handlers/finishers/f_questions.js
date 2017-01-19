/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const PF = require('./../../../const_fields');
const stat      = require('./../../../stat_manager');


module.exports = function (game) {
  
  game.clearTimer();
  
  let result = { [PF.PICKS] : [] };
  
  let players = game.getActivePlayers();
  for(let i = 0; i < players.length; i++) {
    let actions = game.getAction(players[i].id);
    
    if(actions) {
      result[PF.PICKS].push({
        [PF.ID]   : players[i].id,
        [PF.VID]  : players[i].vid,
        [PF.PICK] : actions[0][PF.PICK]
      });
    }
  }
  
  stat.setMainStat(PF.QUESTION_ACITVITY, game.getActivityRating());
  
  game.getHandler(game.CONST.G_START, game.CONST.GT_ST)(game, result, true);
};