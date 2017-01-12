/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config    = require('../../../../../config.json');
const constants = require('../../../../constants');
const oPool     = require('../../../../objects_pool');

const addAction     = require('../../common/add_action');
const finishPause   = require('../finishers/f_pause');

const  RESULTS_TIMEOUT = Number(Config.game.timeouts.results);
const  PF              = constants.PFIELDS;

module.exports = function (game, result, istimeout) { result = result || {}; istimeout = istimeout || false;
  
  // Переход к показу результатов игры
  game._nextGame = constants.G_START;
  
  // Очищаем настройки прошлой игры
  game._activePlayers = {};
  game._actionsQueue = {};
  
  // Отправляем результаты игрокам
  result[PF.NEXTGAME] = game._nextGame;
  result[PF.PLAYERS]  = game.getPlayersID();
  result[PF.PRISON]   = null;
  
  game.checkPrisoner(result);
  
  game.emit(result);
  game._gameState = result;
  
  // Устанавливаем таймаут
  let  timeout = (istimeout)? RESULTS_TIMEOUT : 0;
  game.startTimer(game._handlers.finishers.finishPause, timeout, game);
  
  game._onGame = function (socket, options) {
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
  
    if(game._actionsCount == 0) {
      game._handlers.finishers.finishPause(false, game);
    }
  }
};