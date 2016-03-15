
module.exports = function(game, limit) {
  var item;
  game.gActionsLimits = {};
  for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
    game.gActionsLimits[item] = limit;
  }
};