var constants = require('../../constants');

// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(result, isTimeout) { result = result || {}; isTimeout = isTimeout || false;

  // Переход к показу результатов игры
  this._nextGame = constants.G_START;

  // Очищаем настройки прошлой игры
  this._activePlayers = {};
  this._actionsQueue = {};

  // Отправляем результаты игрокам
  result.next_game = this._nextGame;
  result.players = this.getPlayersID();
  result.prison = null;
  if(this._prisoner !== null) {
    result.prison = {
      id : this._prisoner.id,
      vid: this._prisoner.vid,
      sex: this._prisoner.sex
    }
  }

  this.emit(result);
  this._gameState = result;

  // Устанавливаем таймаут
  var timeout = (isTimeout)? constants.TIMEOUT_RESULTS : 0;
  this.startTimer(this._handlers[this._nextGame], timeout);
};