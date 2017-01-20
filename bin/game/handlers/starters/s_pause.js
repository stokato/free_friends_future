/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 * @param result - Результаты последнего раунда
 * @param istimeout - Следует ли установить таймаут на отображение результатов (иначе сразу в волчку)
 *
 * Начало паузы
 * Получаем результаты предыдущего этапа
 * Отправляем их
 * Устанавливаем таймаут на автозавершение сдедующего этапа
 * Устанавливаем обработчик события выбора игрока
 * Переходим к следующему этапу
 */

const Config = require('./../../../../config.json');
const  PF    = require('./../../../const_fields');

module.exports = function (game, result, istimeout) { result = result || {}; istimeout = istimeout || false;
  
  const  RESULTS_TIMEOUT = Number(Config.game.timeouts.results);
  
  // Переход к показу результатов игры
  game.setNextGame(game.CONST.G_PAUSE);
  
  // Очищаем настройки прошлой игры
  game.clearActivePlayers();
  game.clearActionsQueue();
  
  // Отправляем результаты игрокам
  result[PF.NEXTGAME] = game.CONST.G_PAUSE;
  result[PF.PLAYERS]  = game.getPlayersID();
  result[PF.PRISON]   = null;
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  let  timeout = (istimeout)? RESULTS_TIMEOUT : 0;
  game.startTimer(game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_FIN), timeout, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_ON)(game));
};