/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

module.exports = function (timer, socket, game) {
  clearTimeout(game._timer);
  
  game.restoreGame(null, false);
};