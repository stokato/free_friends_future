/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Завершаем раунд Тюрьма - помещаем игрока в темницу
 * Сразу переходим к этапу завершения паузы (результаты не выводятся)
 *
 */

module.exports = function (game) {
  
  game.clearTimer();
  
  // Помещаем тукущего игрока в темницу
  game.setPrisoner(game.getActivePlayers()[0]);
  
  game.setActionsCount(0);
  
  game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_FIN)(game);
};