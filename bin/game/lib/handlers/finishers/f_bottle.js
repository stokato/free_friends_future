/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const startBottleKisses = require('../starters/s_bottle_kisses');

module.exports = function(timer, game) {
  
  clearTimeout(game._timer);
  
  startBottleKisses(game);
};

