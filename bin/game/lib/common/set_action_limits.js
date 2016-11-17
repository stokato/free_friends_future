// Устанавливаем для всех игроков указанный лемит ходов
module.exports = function(limit) {
  var item;
  this._actionsLimits = {};
  for(item in this._activePlayers) if(this._activePlayers.hasOwnProperty(item)) {
    this._actionsLimits[item] = limit;
  }
};