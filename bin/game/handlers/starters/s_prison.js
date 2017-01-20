/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Начало раунда Темница
 * Отправляем настройки игры
 * Устанавливаем таймаут на автозавершение сдедующего этапа
 * Устанавливаем обработчик события выбора игрока
 * Переходим к следующему этапу
 */

const Config = require('./../../../../config.json');

const PRISON_TIMEOUT = Config.game.timeouts.prison;
const PF             = require('./../../../const_fields');
  
module.exports = function (game) {
  
  game.setNextGame(game.CONST.G_PRISON);
  
  game.clearActionsQueue();
  
  let resultObj = {
    [PF.NEXTGAME] : game.CONST.G_PRISON,
    [PF.PLAYERS] : []
  };
  
  resultObj.players = game.getPlayersID();
  
  game.checkPrisoner(resultObj);
  
  game.sendData(resultObj);
  game.setGameState(resultObj);
  
  game.startTimer(game.getHandler(game.CONST.G_PRISON, game.CONST.GT_FIN), PRISON_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_PRISON, game.CONST.GT_ON)(game));
};