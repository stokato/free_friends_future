/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const finishPause = require('../finishers/f_pause');

module.exports = function (timer, game) {
  clearTimeout(game._timer);
  
  // Помещаем тукущего игрока в темницу
  for(let item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
    game._prisoner = game._activePlayers[item];
  }
  
  game._actionsCount = 0;
  
  game._handlers.finishers.finishPause(true, game);
};