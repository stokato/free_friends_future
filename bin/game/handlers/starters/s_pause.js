/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config    = require('./../../../../config.json');

const  RESULTS_TIMEOUT = Number(Config.game.timeouts.results);
const  PF              = require('./../../../const_fields');

module.exports = function (game, result, istimeout) { result = result || {}; istimeout = istimeout || false;
  
  // Переход к показу результатов игры
  game.setNextGame(game.CONST.G_START);
  
  // Очищаем настройки прошлой игры
  game.clearActivePlayers();
  game.clearActionsQueue();
  
  // Отправляем результаты игрокам
  result[PF.NEXTGAME] = game.CONST.G_START;
  result[PF.PLAYERS]  = game.getPlayersID();
  result[PF.PRISON]   = null;
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  let  timeout = (istimeout)? RESULTS_TIMEOUT : 0;
  game.startTimer(game.getHandler(game.CONST.G_START, game.CONST.GT_FIN), timeout, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_START, game.CONST.GT_ON)(game));
};