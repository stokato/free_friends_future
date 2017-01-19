/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

module.exports = function (game) {
  
  game.clearTimer();
  
  // Если игроков недостаточно - останавливаем игру
  if(!game.checkCountPlayers()) {
    return game.stop();
  }
  
  if(game._onStart) {
    game._onStart();
  }
  
  game.getHandler(game.CONST.G_LOT, game.CONST.GT_ST)(game);
};