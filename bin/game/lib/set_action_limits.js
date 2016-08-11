// Устанавливаем для всех игроков указанный лемит ходов
module.exports = function(limit) {
  var item;
  this.gActionsLimits = {};
  for(item in this.gActivePlayers) if(this.gActivePlayers.hasOwnProperty(item)) {
    this.gActionsLimits[item] = limit;
  }
};