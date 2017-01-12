/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config      = require('../../../../../config.json');
const constants   = require('../../../../constants');
const stat        = require('../../../../stat_manager');
const GameError   = require('../../common/game_error');

const addPoints   = require('../../common/add_points');
const startSympathyShow = require('../starters/s_sympathy_show');

const PF                    = constants.PFIELDS;
const MUTUAL_SYMPATHY_BONUS = Number(Config.points.game.mutual_sympathy);

module.exports = function (timer, game) {
  clearTimeout(game._timer);
  
  stat.setMainStat(constants.SFIELDS.SYMPATHY_ACITVITY, game.getActivityRating());
  
  let players = [], count = 0;
  
  for(let selfID in game._actionsQueue) if (game._actionsQueue.hasOwnProperty(selfID)) {
    let selfPicks = game._actionsQueue[selfID];
    
    for(let selfPickOptions = 0; selfPickOptions < selfPicks.length; selfPickOptions++) {
      let selfPick = selfPicks[selfPickOptions][PF.PICK];
      
      let otherPicks = game._actionsQueue[selfPick];
      if(otherPicks) {
        for(let otherPickOptions = 0; otherPickOptions < otherPicks.length; otherPickOptions++) {
          let otherPick = otherPicks[otherPickOptions][PF.PICK];
          if(otherPick && otherPick == selfID) {
            players.push(selfID);
          }
        }
      }
    }
  }
  
  if(players.length > 0) {
    addPoints(players[count], MUTUAL_SYMPATHY_BONUS, onComplete);
  }
  
  // Сохраняем выбор игроков
  game._storedOptions = game._actionsQueue;
  
  startSympathyShow(game);
  
  //---------------------
  function onComplete(err) {
    if(err) { return new GameError(constants.G_SYMPATHY, err.message); }
    
    count++;
    if(count < players.length) {
      addPoints(players[count], MUTUAL_SYMPATHY_BONUS, onComplete);
    }
  }
};