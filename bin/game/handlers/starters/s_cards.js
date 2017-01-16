/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config        = require('./../../../../config.json');
const constants    = require('./../../../constants');

const DEF_TIMEOUT    = Number(Config.game.timeouts.default);
const PF             = constants.PFIELDS;

module.exports = function (game) {
  
  game.clearActionsQueue();
  
  game.clearActivePlayers();
  game.activateAllPlayers();
  
  game.setActionLimit(1);
  
  let countPrisoners = (game.getPrisonerInfo() === null)? 0 : 1;
  
  game.setActionsCount(game.getCountUsers() - countPrisoners);
  game.setActionsMain(game.getActionsCount());
  
  game.setNextGame(constants.G_CARDS);
  
  let result = {
    [PF.NEXTGAME] : constants.G_CARDS,
    [PF.PLAYERS] : []
  };
  
  result.players = game.getPlayersID();
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(constants.G_CARDS, constants.GT_FIN), DEF_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(constants.G_CARDS, constants.GT_ON)(game));
};