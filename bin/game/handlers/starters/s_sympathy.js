/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config      = require('./../../../../config.json');
const constants   = require('./../../../constants');

const DEF_TIMEOUT    = Number(Config.game.timeouts.default);
const PF             = constants.PFIELDS;

module.exports = function (game) {
  
  game.setNextGame(constants.G_SYMPATHY);
  
  game.clearActionsQueue();
  
  game.clearActivePlayers();
  game.activateAllPlayers();
  
  game.setActionLimit(Config.game.show_sympathy_limit);
  
  let countPrisoners = (game.getPrisonerInfo() === null)? 0 : 1;
  game.setActionsCount((game.getCountUsers() - countPrisoners) * 2);
  game.getActionsMain(game.getActionsCount());
  
  let result = {
    [PF.NEXTGAME] : constants.G_SYMPATHY,
    [PF.PLAYERS]  : game.getPlayersID()
  };
  
  game.checkPrisoner(result);
  
  game.emit(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(constants.G_SYMPATHY, constants.GT_FIN), DEF_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(constants.G_SYMPATHY, constants.GT_ON)(game));
};