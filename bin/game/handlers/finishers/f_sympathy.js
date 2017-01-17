/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config      = require('./../../../../config.json');
const constants   = require('./../../../constants');
const stat        = require('./../../../stat_manager');
const logger      = require('./../../../../lib/log')(module);

const addPoints   = require('./../../lib/add_points');

const PF                    = constants.PFIELDS;
const MUTUAL_SYMPATHY_BONUS = Number(Config.points.game.mutual_sympathy);

module.exports = function (game) {
  
  game.clearTimer();
  
  stat.setMainStat(constants.SFIELDS.SYMPATHY_ACITVITY, game.getActivityRating());
  
  let players = game.getActivePlayers();
  let mutuals = [];
  for(let i = 0; i < players.length; i++) {
    let actions = game.getAction(players[i].id);
    
    // Первый игрок ходил
    if(actions) {
      for(let a = 0; a < actions.length; a++) {
        let selfPick = actions[a][PF.PICK];
        
        let otherActions = game.getAction(selfPick);
        // Другой тоже ходил
        if(otherActions) {
          for(let o = 0; o < otherActions.length; o++) {
            let otherPick = otherActions[o][PF.PICK];
            
            // Они выбрали друг друга
            if(otherPick == players[i].id) {
              mutuals.push(players[i].id);
            }
          }
        }
      }
    }
  }
  
  if(mutuals.length > 0) {
    let count = 0;
    addPoints(mutuals[count], MUTUAL_SYMPATHY_BONUS, onComplete(mutuals, count));
  }
  
  // Сохраняем выбор игроков
  game.saveActionsQueue();
  
  game.getHandler(game.CONST.G_SYMPATHY_SHOW, game.CONST.GT_ST)(game);
  
  //-------------------------------------
  function onComplete (mutuals, count) {
    return function (err) {
      if (err) {
        logger.error(game.CONST.G_SYMPATHY + ' ' + game.CONST.GT_FIN);
        logger.error(err);
      }
    
      count++;
      if (count < mutuals.length) {
        addPoints(mutuals[count], MUTUAL_SYMPATHY_BONUS, onComplete(mutuals, count));
      }
    }
  }
};