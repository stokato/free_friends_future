/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const constants = require('./../../../constants');

module.exports = function (game) {
  
  game.clearTimer();
  
  // Помещаем тукущего игрока в темницу
  game.setPrisoner(game.getActivePlayers()[0]);
  
  game.setActionsCount(0);
  
  game.getHandler(constants.G_START, constants.GT_FIN)(game);
};