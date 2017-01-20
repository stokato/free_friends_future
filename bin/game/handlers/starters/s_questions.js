/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Начало раунда Вопросы
 * Разрешаем всем игрокам делать выбор
 * Отправляем настройки игры
 * Устанавливаем таймаут на автозавершение сдедующего этапа
 * Устанавливаем обработчик события выбора игрока
 * Переходим к следующему этапу
 */

const Config  = require('./../../../../config.json');
const PF      = require('./../../../const_fields');

module.exports = function (game) {
  
  const DEF_TIMEOUT    = Number(Config.game.timeouts.default);
  
  game.setNextGame(game.CONST.G_QUESTIONS);
  
  game.clearActionsQueue();
  
  game.clearActivePlayers();
  game.activateAllPlayers();
  
  game.setActionLimit(1);
  
  let countPrisoners = (game.getPrisonerInfo() === null)? 0 : 1;
  
  game.setActionsCount(game.getCountUsers() - countPrisoners);
  game.setActionsMain(game.getActionsCount());
  
  let resultObj = {
    [PF.NEXTGAME] : game.CONST.G_QUESTIONS,
    [PF.QUESTION] : game.getRandomQuestion(),
    [PF.PLAYERS]  : game.getPlayersID()
  };
  
  game.checkPrisoner(resultObj);
  
  game.sendData(resultObj);
  game.setGameState(resultObj);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_QUESTIONS, game.CONST.GT_FIN), DEF_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_QUESTIONS, game.CONST.GT_ON)(game));
};