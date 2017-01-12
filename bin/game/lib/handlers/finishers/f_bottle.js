/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const onBottleKisses = require('./../pickers/p_bottle_kisses');

module.exports = function(timer, socket, game) {
  
  clearTimeout(game._timer);
  
  game._onGame = onBottleKisses(game);
};

