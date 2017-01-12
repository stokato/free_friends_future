/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const constants = require('../../../../constants');
const stat      = require('../../../../stat_manager');

const startPause = require('../starters/s_pause');

const PF = constants.PFIELDS;

module.exports = function (timer, game) {
  
  clearTimeout(game._timer);
  
  let result = { [PF.PICKS] : [] };
  
  let playerInfo, picks;
  for (let item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
    playerInfo = game._activePlayers[item];
    picks = game._actionsQueue[playerInfo.id];
    
    if(picks) {
      let pick = {
        [PF.ID]   : playerInfo.id,
        [PF.VID]  : playerInfo.vid,
        [PF.PICK] : picks[0][PF.PICK]
      };
      
      result[PF.PICKS].push(pick);
    }
  }
  
  stat.setMainStat(constants.SFIELDS.QUESTION_ACITVITY, game.getActivityRating());
  
  game._handlers.starters.startPause(game, result, true);
};