/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const startLot = require('../starters/s_lot');

module.exports = function (timer, game) {
  clearTimeout(game._timer);
  
  // Если игроков недостаточно - останавливаем игру
  if(!game.checkCountPlayers()) {
    return game.stop();
  }
  
  if(game._onStart) {
    game._onStart();
  }
  
  game._handlers.starters.startLot(game);
};