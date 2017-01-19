/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config      = require('./../../../../config.json');

const DEF_TIMEOUT = Number(Config.game.timeouts.default);
const PF          = require('./../../../const_fields');

module.exports = function (game) {
  
  game.setNextGame(game.CONST.G_BOTTLE_KISSES);
  
  let players = game.getStoredOptions();
  let rand = Math.floor(Math.random() * players.length);
  let spInfo = players[rand];
  
  // Разрешаем второму игроку ходить
  game.setActivePlayer(spInfo.id, spInfo);
  
  // Оба могут ответить по разу
  game.clearActionsQueue();
  game.setActionLimit(1);
  game.setActionsCount(2);
  game.setActionsMain(2);
  
  // Отправляем результаты
  let result = {
    [PF.PLAYERS]  : game.getPlayersID(),
    [PF.NEXTGAME] : game.CONST.G_BOTTLE_KISSES,
    [PF.PRISON]   : null
  };
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_BOTTLE_KISSES, game.CONST.GT_FIN), DEF_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_BOTTLE_KISSES, game.CONST.GT_ON)(game));
};