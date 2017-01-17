/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

module.exports = function (game) {
  game.clearTimer();
  
  game.getHandler(game.CONST.G_START, game.CONST.GT_ST)(game, null, false);
};