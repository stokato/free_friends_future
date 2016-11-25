var constants = require('../../../constants'),
  PF = constants.PFIELDS;

// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(result, isTimeout) { result = result || {}; isTimeout = isTimeout || false;

  // Переход к показу результатов игры
  this._nextGame = constants.G_START;

  // Очищаем настройки прошлой игры
  this._activePlayers = {};
  this._actionsQueue = {};

  // Отправляем результаты игрокам
  result[PF.NEXTGAME] = this._nextGame;
  result[PF.PLAYERS]  = this.getPlayersID();
  result[PF.PRISON] = null;
  
  if(this._prisoner !== null) {
    result.prison = {};
    result[PF.PRISON][PF.ID]  = this._prisoner.id;
    result[PF.PRISON][PF.VID] = this._prisoner.vid;
    result[PF.PRISON][PF.SEX] = this._prisoner.sex;
  }

  this.emit(result);
  this._gameState = result;

  // Устанавливаем таймаут
  var timeout = (isTimeout)? constants.TIMEOUT_RESULTS : 0;
  this.startTimer(this._handlers[this._nextGame], timeout);
};