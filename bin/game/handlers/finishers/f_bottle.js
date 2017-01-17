/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const constants = require('./../../../constants');

module.exports = function(game) {
  
  game.clearTimer();
  
  game.getHandler(game.CONST.G_BOTTLE_KISSES, game.CONST.GT_ST)(game);
};

