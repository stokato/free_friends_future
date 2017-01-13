// Устанавливаем для всех игроков указанный лемит ходов
module.exports = function(limit) {
  this._actionsLimits = {};
  for(let item in this._activePlayers) if(this._activePlayers.hasOwnProperty(item)) {
    this._actionsLimits[item] = limit;
  }
};