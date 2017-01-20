/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Завершаем паузу в игре
 * Проверяем количество игроков - если мало - останавливаем игру
 * Переходим к раунду - Волчек
 *
 */

module.exports = function (game) {
  
  game.clearTimer();
  
  // Если игроков недостаточно - останавливаем игру
  if(!game.checkCountPlayers()) {
    return game.stop();
  }
  
  // Выполняем делегиуемый обработчик события завершения раунда
  if(game._onStart) {
    game._onStart();
  }
  
  game.getHandler(game.CONST.G_LOT, game.CONST.GT_ST)(game);
};