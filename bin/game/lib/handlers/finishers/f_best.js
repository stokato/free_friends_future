/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config       = require('../../../../../config.json');
const constants    = require('../../../../constants');
const stat         = require('../../../../stat_manager');

const  addPoints   = require('../../common/add_points');
const  handleError = require('../../common/handle_error');

const BEST_POINTS  = Number(Config.points.game.best);

module.exports = function (timer, socket, game) {
  clearTimeout(game._timer);
  
  stat.setMainStat(constants.SFIELDS.BEST_ACTIVITY, game.getActivityRating());
  
  // Если кто-то голосовал - показываем результаты, либо сразу переходим к волчку
  if(game._actionsCount != game._actionsMain) {
    
    // Проверяем - кто выбран лучшим, начисляем ему очки
    let bestPlayer = { id: null, picks : 0 };
    
    for(let bestID in game._storedOptions) if (game._storedOptions.hasOwnProperty(bestID)) {
      let profInfo = game._storedOptions[bestID];
      if(profInfo.picks > bestPlayer.picks) {
        bestPlayer.id = bestID;
        bestPlayer.vid = profInfo.vid;
        bestPlayer.picks = profInfo.picks;
      } else if(profInfo.picks == bestPlayer.picks) {
        bestPlayer.id = null;
        bestPlayer.vid = null;
      }
    }
    
    if(bestPlayer.id) {
      stat.setUserStat(bestPlayer.id, bestPlayer.vid, constants.SFIELDS.BEST_SELECTED, 1);
      addPoints(bestPlayer.id, BEST_POINTS, function (err) {
        if(err) {
          let socket = game._room.getAnySocket();
          return handleError(socket, constants.IO_GAME, constants.G_BEST, err.message);
        }
      });
    }
    
    game.restoreGame(null, true);
  } else {
    game.restoreGame(null, false);
  }
};
