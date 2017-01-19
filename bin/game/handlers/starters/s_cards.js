/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config        = require('./../../../../config.json');

const DEF_TIMEOUT    = Number(Config.game.timeouts.default);
const PF             = require('./../../../const_fields');

module.exports = function (game) {
  
  game.clearActionsQueue();
  
  game.clearActivePlayers();
  game.activateAllPlayers();
  
  game.setActionLimit(1);
  
  let countPrisoners = (game.getPrisonerInfo() === null)? 0 : 1;
  
  game.setActionsCount(game.getCountUsers() - countPrisoners);
  game.setActionsMain(game.getActionsCount());
  
  game.setNextGame(game.CONST.G_CARDS);
  
  let result = {
    [PF.NEXTGAME] : game.CONST.G_CARDS,
    [PF.PLAYERS] : []
  };
  
  result.players = game.getPlayersID();
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_CARDS, game.CONST.GT_FIN), DEF_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_CARDS, game.CONST.GT_ON)(game));
};