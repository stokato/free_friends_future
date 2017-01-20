/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Начало раунда Симпатии - второго этапа
 * Разрешаем всем игрокам делать выбор - количество равно числу игроков
 * Отправляем настройки игры
 * Устанавливаем таймаут на автозавершение сдедующего этапа
 * Устанавливаем обработчик события выбора игрока
 * Переходим к следующему этапу
 */

const Config = require('./../../../../config.json');
const PF     = require('./../../../const_fields');


module.exports = function (game) {
  
  const SYMPATHY_TIMEOUT  = Number(Config.game.timeouts.sympathy_show);
  
  game.setNextGame(game.CONST.G_SYMPATHY_SHOW);
  
  // Очищаем настройки
  game.clearActionsQueue();
  
  // Все игроки могут посмотреть результаты всех
  let countPrisoners = (game.getPrisonerInfo() === null)? 0 : 1;
  
  game.setActionLimit(game.getCountUsers() - 1 - countPrisoners);

  game.setActionsCount((game.getCountUsers() - countPrisoners) * 10);
  game.setActionsMain(game.getActionsCount());
  
  // Отправляем результаты
  let resultObj = {
    [PF.NEXTGAME] : game.CONST.G_SYMPATHY_SHOW,
    [PF.PLAYERS]  : game.getPlayersID(),
    [PF.PRISON]   : null
  };
  
  game.checkPrisoner(resultObj);
  
  game.sendData(resultObj);
  
  // Сохраняем состояние игры
  game.setGameState(resultObj);
  
  // Устанавливаем таймер
  game.startTimer(game.getHandler(game.CONST.G_SYMPATHY_SHOW, game.CONST.GT_FIN), SYMPATHY_TIMEOUT, game);

 game.setOnGame(game.getHandler(game.CONST.G_SYMPATHY_SHOW, game.CONST.GT_ON)(game));
};