/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const startPause = require('../starters/s_pause');

module.exports = function (timer, game) {
  clearTimeout(game._timer);
  
  game._handlers.starters.startPause(game, null, false);
};