/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Завершаем раунд игры Симпатии
 * Ставим игру на паузу
 *
 */

module.exports = function (game) {
  game.clearTimer();
  
  game.getHandler(game.CONST.G_PAUSE, game.CONST.GT_ST)(game, null, false);
};