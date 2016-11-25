/**
 * Created by s.t.o.k.a.t.o on 25.11.2016.
 */

module.exports = function (game, uid, options) {
  game._actionsLimits[uid] --;
  
  game._actionsQueue[uid].push(options);
  game._actionsCount--;
};