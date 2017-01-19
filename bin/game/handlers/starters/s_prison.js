/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config = require('./../../../../config.json');

const PRISON_TIMEOUT = Config.game.timeouts.prison;
const PF             = require('./../../../const_fields');
  
module.exports = function (game) {
  
  game.setNextGame(game.CONST.G_PRISON);
  
  game.clearActionsQueue();
  
  let result = {
    [PF.NEXTGAME] : game.CONST.G_PRISON,
    [PF.PLAYERS] : []
  };
  
  result.players = game.getPlayersID();
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  game.startTimer(game.getHandler(game.CONST.G_PRISON, game.CONST.GT_FIN), PRISON_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_PRISON, game.CONST.GT_ON)(game));
};