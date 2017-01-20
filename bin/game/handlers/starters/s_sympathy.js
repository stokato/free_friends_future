/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Начало раунда Симпатии - первого этапа
 * Разрешаем всем игрокам делать выбор - можно выбрать несколько ироков
 * Отправляем настройки игры
 * Устанавливаем таймаут на автозавершение сдедующего этапа
 * Устанавливаем обработчик события выбора игрока
 * Переходим к следующему этапу
 */

const Config      = require('./../../../../config.json');

const DEF_TIMEOUT    = Number(Config.game.timeouts.default);
const PF             = require('./../../../const_fields');

module.exports = function (game) {
  
  game.setNextGame(game.CONST.G_SYMPATHY);
  
  game.clearActionsQueue();
  
  game.clearActivePlayers();
  game.activateAllPlayers();
  
  game.setActionLimit(Config.game.show_sympathy_limit);
  
  let countPrisoners = (game.getPrisonerInfo() === null)? 0 : 1;
  game.setActionsCount((game.getCountUsers() - countPrisoners) * 2);
  game.getActionsMain(game.getActionsCount());
  
  let resultObj = {
    [PF.NEXTGAME] : game.CONST.G_SYMPATHY,
    [PF.PLAYERS]  : game.getPlayersID()
  };
  
  game.checkPrisoner(resultObj);
  
  game.sendData(resultObj);
  game.setGameState(resultObj);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_SYMPATHY, game.CONST.GT_FIN), DEF_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_SYMPATHY, game.CONST.GT_ON)(game));
};