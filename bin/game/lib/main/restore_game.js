/**
 * Сообщаем результаты игры и готовим запуск следующей игры
 *
 * @param result - объект с результатами предидущей игры, istimeout - устанавливать таймаут на старт следующей игры
 */
var Config        = require('./../../../../config.json');
var constants = require('../../../constants'),
    PF        = constants.PFIELDS;

var RESULTS_TIMEOUT = Number(Config.game.timeouts.results);

module.exports = function(result, istimeout) { result = result || {}; istimeout = istimeout || false;

  // Переход к показу результатов игры
  this._nextGame = constants.G_START;

  // Очищаем настройки прошлой игры
  this._activePlayers = {};
  this._actionsQueue = {};

  // Отправляем результаты игрокам
  result[PF.NEXTGAME] = this._nextGame;
  result[PF.PLAYERS]  = this.getPlayersID();
  result[PF.PRISON]   = null;
  
  if(this._prisoner !== null) {
    result.prison = {};
    result[PF.PRISON][PF.ID]  = this._prisoner.id;
    result[PF.PRISON][PF.VID] = this._prisoner.vid;
    result[PF.PRISON][PF.SEX] = this._prisoner.sex;
  }

  this.emit(result);
  this._gameState = result;

  // Устанавливаем таймаут
  var timeout = (istimeout)? RESULTS_TIMEOUT : 0;
  this.startTimer(this._handlers[this._nextGame], timeout);
};