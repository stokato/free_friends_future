/**
 * Сообщаем результаты игры и готовим запуск следующей игры
 *
 * @param result - объект с результатами предидущей игры, istimeout - устанавливать таймаут на старт следующей игры
 */
const  Config    = require('./../../../../config.json');
const  constants = require('../../../constants');

const  RESULTS_TIMEOUT = Number(Config.game.timeouts.results);
const  PF              = constants.PFIELDS;

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
    result.prison = {
      [PF.ID]  : this._prisoner.id,
      [PF.VID] : this._prisoner.vid,
      [PF.SEX] : this._prisoner.sex
    };
  }

  this.emit(result);
  this._gameState = result;

  // Устанавливаем таймаут
  let  timeout = (istimeout)? RESULTS_TIMEOUT : 0;
  this.startTimer(this._handlers[this._nextGame], timeout);
};