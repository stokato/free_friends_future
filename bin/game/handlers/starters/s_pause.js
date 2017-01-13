/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config    = require('./../../../../config.json');
const constants = require('./../../../constants');

const  RESULTS_TIMEOUT = Number(Config.game.timeouts.results);
const  PF              = constants.PFIELDS;

module.exports = function (game, result, istimeout) { result = result || {}; istimeout = istimeout || false;
  
  // Переход к показу результатов игры
  game.setNextGame(constants.G_START);
  
  // Очищаем настройки прошлой игры
  game.clearActivePlayers();
  game.clearActionsQueue();
  
  // Отправляем результаты игрокам
  result[PF.NEXTGAME] = constants.G_START;
  result[PF.PLAYERS]  = game.getPlayersID();
  result[PF.PRISON]   = null;
  
  game.checkPrisoner(result);
  
  game.emit(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  let  timeout = (istimeout)? RESULTS_TIMEOUT : 0;
  game.startTimer(game.getHandler(constants.G_START, constants.GT_FIN), timeout, game);
  
  game.setOnGame(game.getHandler(constants.G_START, constants.GT_ON)(game));
};