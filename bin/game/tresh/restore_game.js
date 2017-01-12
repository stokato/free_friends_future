/**
 * Сообщаем результаты игры и готовим запуск следующей игры
 *
 * @param result - объект с результатами предидущей игры, istimeout - устанавливать таймаут на старт следующей игры
 */
const  Config    = require('./../../../config.json');
const  constants = require('../../constants');

const onStart    = require('./p_start');
const checkPrisoner = require('../lib/common/check_prisoner');

const  RESULTS_TIMEOUT = Number(Config.game.timeouts.results);
const  PF              = constants.PFIELDS;

module.exports = function(result, istimeout) { result = result || {}; istimeout = istimeout || false;

  // Переход к показу результатов игры
  this._nextGame = constants.G_START;
  this._onGame = onStart(this);

  // Очищаем настройки прошлой игры
  this._activePlayers = {};
  this._actionsQueue = {};

  // Отправляем результаты игрокам
  result[PF.NEXTGAME] = this._nextGame;
  result[PF.PLAYERS]  = this.getPlayersID();
  result[PF.PRISON]   = null;
  
  checkPrisoner(this, result);

  this.emit(result);
  this._gameState = result;

  // Устанавливаем таймаут
  let  timeout = (istimeout)? RESULTS_TIMEOUT : 0;
  this.startTimer(this._onGame, timeout, this);
};