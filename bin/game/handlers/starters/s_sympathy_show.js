/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config      = require('./../../../../config.json');
const constants   = require('./../../../constants');

const PF                = constants.PFIELDS;
const SYMPATHY_TIMEOUT  = Number(Config.game.timeouts.sympathy_show);

module.exports = function (game) {
  
  game.setNextGame(game.CONST.G_SYMPATHY_SHOW);
  
  // Очищаем настройки
  game.clearActionsQueue();
  
  // Все игроки могут посмотреть результаты всех
  let countPrisoners = (game.getPrisonerInfo() === null)? 0 : 1;
  
  game.setActionLimit(game.getCountUsers() - 1 - countPrisoners);

  game.setActionsCount((game.getCountUsers() - countPrisoners) * 10);
  game.setActionsMain(game.getActionsCount());
  
  // Отправляем результаты
  let result = {
    [PF.NEXTGAME] : game.CONST.G_SYMPATHY_SHOW,
    [PF.PLAYERS]  : game.getPlayersID(),
    [PF.PRISON]   : null
  };
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  
  // Сохраняем состояние игры
  game.setGameState(result);
  
  // Устанавливаем таймер
  game.startTimer(game.getHandler(game.CONST.G_SYMPATHY_SHOW, game.CONST.GT_FIN), SYMPATHY_TIMEOUT, game);

 game.setOnGame(game.getHandler(game.CONST.G_SYMPATHY_SHOW, game.CONST.GT_ON)(game));
};