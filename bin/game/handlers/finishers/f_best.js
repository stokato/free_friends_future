/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config       = require('./../../../../config.json');
const constants    = require('./../../../constants');
const stat         = require('./../../../stat_manager');

const  addPoints   = require('./../../lib/add_points');
const  emitRes     = require('./../../../emit_result');

const BEST_POINTS  = Number(Config.points.game.best);
const PF           = constants.PFIELDS;

module.exports = function (game) {
  game.clearTimer();
  
  stat.setMainStat(constants.SFIELDS.BEST_ACTIVITY, game.getActivityRating());
  
  // Если кто-то голосовал - показываем результаты, либо сразу переходим к волчку
  if(game.getActionsCount() != game.getActionsMain()) {
    
    // Проверяем - кто выбран лучшим
    let bests = game.getStoredOptions();
    let players = game.getActivePlayers();
    
    let theBest = { id: null, count : 0 };
    
    for (let i = 0; i < players.length; i++) {
      let actions = game.getAction(players[i].id);
      
      if(actions && actions[0] && bests[actions[0][PF.PICK]]) {
        let best = bests[actions[0][PF.PICK]];
        best.count = best.count + 1 || 1;
  
        if(best.count > theBest.count) {
          theBest.id = best[PF.ID];
          theBest.vid = best[PF.VID];
          theBest.count = best.count;
          
        } else if(best.count == theBest.count) {
          theBest.id = null;
          theBest.vid = null;
        }
      }
      
    }
    
    // for(let bestID in game._storedOptions) if (game._storedOptions.hasOwnProperty(bestID)) {
    //   let profInfo = game._storedOptions[bestID];
    //   if(profInfo.picks > bestPlayer.picks) {
    //     bestPlayer.id = bestID;
    //     bestPlayer.vid = profInfo.vid;
    //     bestPlayer.picks = profInfo.picks;
    //   } else if(profInfo.picks == bestPlayer.picks) {
    //     bestPlayer.id = null;
    //     bestPlayer.vid = null;
    //   }
    // }
    
    // Если есть победитель - начисляем ему очки
    if(theBest.id) {
      stat.setUserStat(theBest.id, theBest.vid, constants.SFIELDS.BEST_SELECTED, 1);
      
      addPoints(theBest.id, BEST_POINTS, function (err) {
        if(err) {
          let socket = game.getRoom().getAnySocket();
          return emitRes(err, socket, constants.IO_GAME_ERROR);
        }
      });
    }
  
    game.getHandler(constants.G_START, constants.GT_ST)(game, null, true);
  } else {
    game.getHandler(constants.G_START, constants.GT_ST)(game, null, false);
  }
};
