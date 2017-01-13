/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config = require('./../../../../config.json');
const constants = require('./../../../constants');

const PRISON_TIMEOUT = Config.game.timeouts.prison;
const PF             = constants.PFIELDS;
  
module.exports = function (game) {
  
  game.setNextGame(constants.G_PRISON);
  
  game.clearActionsQueue();
  
  let result = {
    [PF.NEXTGAME] : constants.G_PRISON,
    [PF.PLAYERS] : []
  };
  
  result.players = game.getPlayersID();
  
  game.checkPrisoner(result);
  
  game.emit(result);
  game.setGameState(result);
  
  game.startTimer(game.getHandler(constants.G_PRISON, constants.GT_FIN), PRISON_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(constants.G_PRISON, constants.GT_ON)(game));
};