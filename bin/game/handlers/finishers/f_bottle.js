/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Завершаем первый этап раунда Бутылочка,
 * Переходим ко второму
 *
 */

module.exports = function(game) {
  
  game.clearTimer();
  
  game.getHandler(game.CONST.G_BOTTLE_KISSES, game.CONST.GT_ST)(game);
};

