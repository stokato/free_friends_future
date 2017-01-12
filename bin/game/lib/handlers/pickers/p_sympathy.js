/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config      = require('../../../../../config.json');
const constants   = require('../../../../constants');
const oPool       = require('../../../../objects_pool');

const addAction       = require('../../common/add_action');
const handleError     = require('../../common/handle_error');
const finishSympathy  = require('../finishers/f_sympathy');
const checkPrisoner = require('./../../common/check_prisoner');

const DEF_TIMEOUT    = Number(Config.game.timeouts.default);

module.exports = function (game, result) {
  game._activePlayers = {};
  game.activateAllPlayers();
  
  game.setActionLimit(Config.game.show_sympathy_limit);
  
  let countPrisoners = (game._prisoner === null)? 0 : 1;
  game._actionsCount = (game._currCountInRoom - countPrisoners) * 2;
  game._actionsMain = game._actionsCount;
  
  result.players = game.getPlayersID();
  
  checkPrisoner(game, result);
  
  game.emit(result);
  game._gameState = result;
  
  // Устанавливаем таймаут
  game.startTimer(game._handlers[game._nextGame], DEF_TIMEOUT);
  
  return function (socket, options) {
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    // В игре симпатии нельзя указать себя
    if(game._nextGame == constants.G_SYMPATHY && uid == options[constants.PFIELDS.PICK]) {
      return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY, constants.errors.SELF_ILLEGAL);
    }
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    // В игре Симпатии нельзя выбрать несколько раз одного и того же игрока
    // И выбрать того, кого нет
    if(!game._activePlayers[options[constants.PFIELDS.PICK]]) {
      return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY, constants.errors.IS_ALREADY_SELECTED);
    }
  
    let actions = game._actionsQueue[uid];
  
    for( let i = 0; i < actions.length; i++) {
      if(actions[i][constants.PFIELDS.PICK] == options[constants.PFIELDS.PICK]) {
        return handleError(socket, constants.IO_GAME, constants.G_SYMPATHY, constants.errors.FORBIDDEN_CHOICE);
      }
    }
  
    addAction(game, uid, options);
  
    if(game._actionsCount == 0) {
      finishSympathy(false, socket, game);
    }
  }
};