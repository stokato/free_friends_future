
module.exports = function(game, limit) {
  var item;
  game.answersLimits = {};
  for(item in game.currPlayers) if(game.currPlayers.hasOwnProperty(item)) {
    game.answersLimits[item] = limit;
  }
};