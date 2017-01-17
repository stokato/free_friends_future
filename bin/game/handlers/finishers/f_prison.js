/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

module.exports = function (game) {
  
  game.clearTimer();
  
  // Помещаем тукущего игрока в темницу
  game.setPrisoner(game.getActivePlayers()[0]);
  
  game.setActionsCount(0);
  
  game.getHandler(game.CONST.G_START, game.CONST.GT_FIN)(game);
};