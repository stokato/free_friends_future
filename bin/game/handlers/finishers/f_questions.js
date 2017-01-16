/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const constants = require('./../../../constants');
const stat      = require('./../../../stat_manager');

const PF = constants.PFIELDS;

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
  
  stat.setMainStat(constants.SFIELDS.QUESTION_ACITVITY, game.getActivityRating());
  
  game.getHandler(constants.G_START, constants.GT_ST)(game, result, true);
};