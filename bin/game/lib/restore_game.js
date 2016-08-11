var constants = require('../../constants');

// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(result, isTimeout) { result = result || {}; isTimeout = isTimeout || false;

  // Переход к показу результатов игры
  this.gNextGame = constants.G_START;

  // Очищаем настройки прошлой игры
  this.gActivePlayers = {};
  this.gActionsQueue = {};

  //// Активируем всех игроков, каждый делает по ходу
  //this.activateAllPlayers();
  //this.setActionLimit(1);
  //
  //var countPrisoners = (this.gPrisoner === null)? 0 : 1;
  //this.gActionsCount = this.gRoom.girls_count + this.gRoom.guys_count - countPrisoners;

  // Отправляем результаты игрокам
  result.next_game = this.gNextGame;
  result.players = this.getPlayersID();
  result.prison = null;
  if(this.gPrisoner !== null) {
    result.prison = {
      id : this.gPrisoner.id,
      vid: this.gPrisoner.vid,
      sex: this.gPrisoner.sex
    }
  }

  this.emit(result);
  this.gameState = result;

  // Устанавливаем таймаут
  var timeout = (isTimeout)? constants.TIMEOUT_RESULTS : 0;
  this.startTimer(this.gHandlers[this.gNextGame], timeout);
};