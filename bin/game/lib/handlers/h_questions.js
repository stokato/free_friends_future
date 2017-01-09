const constants = require('./../../../constants');
const PF = constants.PFIELDS;
const addAction = require('./../common/add_action');
const oPool = require('./../../../objects_pool'),
    stat = require('./../../../stat_manager');

// Вопросы, ждем, когда все ответят, потом показываем ответы
module.exports = function(game) {
  return function(timer, socket, options) {
  
    if(!timer) {
      let selfProfile = oPool.userList[socket.id];
      let uid = selfProfile.getID();
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
  
      addAction(game, uid, options);
    }

    //---------------------------------------------------------------
    if(game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      let result = {
        [PF.PICKS] : []
      };

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
      
      game.restoreGame(result, true);
    }
  }
};