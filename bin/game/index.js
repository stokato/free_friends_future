/**
 * @param room
 * @constructor
 *
 * Класс Игра, стартует, когда набирается достаточное количество игроков и отанавливается, когди их меньше
 * С заданной периодичностью запускает случайную игру из списка, обрабатывает действия игроков, начисляет
 * призовые очки и монеты
 */

// Методы
const start                 = require('./lib/start_game');
const stop                  = require('./lib/stop_game');
const sendData              = require('./lib/send_data');
const setActionLimit        = require('./lib/set_action_limits');
const activateAllPlayers    = require('./lib/activate_all_players');
const getPlayersId          = require('./lib/get_players_id');
const startTimer            = require('./lib/start_timer');
const getPlayerInfo         = require('./lib/get_player_info');
const selectNextPlayer      = require('./lib/get_next_player');
const checkCountPlayers     = require('./lib/check_count_players');
const addEmits              = require('./lib/add_emits');
const getActivityRating     = require('./lib/get_activity_rating');
const checkPrisoner         = require('./lib/check_prisoner');
const getActivePlayers      = require('./lib/get_active_players');
const addAction             = require('./lib/add_action');
const removeProtection      = require('./lib/remove_protection');
const addPoints             = require('./lib/add_points');

const handlers              = require('./handlers/index');
const gameConstants         = require('./constants');

function Game(room) {
  
  this.CONST = gameConstants;
  
  this._isActive = false;                // Флаг - игра запущена или нет

  this._room            = room;          // Комната, которй принадлежить эта игра
  
  this._storedRand      = null;          // Предидущий выбор игры (чтобы подряд не повторялся)

  this._actionsQueue    = {};            // Очередь действий игроков
  this._actionsLimits   = {};            // Лимиты ответов для игроков
  this._actionsCount    = 0;             // Текущее количество ответов до перехода к следующей игре
  this._actionsMain     = 0;             // Общее количество ответов до перехода к следующей игре
  
  this._currCountInRoom = 0;             // Количество игроков в комнате на начало текущего раунда

  this._storedOptions   = {};            // опции, сохраненные на предидущих этапах
  this._activePlayers   = {};            // Игроки, которые на данном этапе могут ходить
  this._prisoner        = null;          // Игрок в темнице

  this._nextGame        = null;          // Игра, которая будет вызвана следующей

  this._timer           = null;          // Таймер, ограничивает время действия игроков, вызвывает следующую игру

  this._gameState       = null;          // Состояние игры (отпавляется игроку в случае разрыва соединения)

  this._girlsIndex      = 0;             // Индекс играющей девушки
  this._guysIndex       = 0;             // и парня
  this._currentSex      = 1;             // текущий пол
  
  this._onStart         = null;          // Срабатывает при старте очередного раунда и при остановке
  this._onGame          = null;          // Обработка хода игрока
  
  this._handlers        = handlers;      // Обработчики раундов игры
  
  this._prisonProtection  = {};          // Защита от попадания в тюрьму
  
  let self = this;
  this._room.setOnDeleteProfile((profile) => {
    let uid = profile.getID();
    
    if(self._prisonProtection[uid]) {
      delete self._prisonProtection[uid];
    }
  })
}

Game.prototype.getGameState       = function () { return this._gameState; };
Game.prototype.getPrisonerInfo    = function () { return this._prisoner; };
Game.prototype.isActive           = function () { return this._isActive; };
Game.prototype.getNextGame        = function () { return this._nextGame; };
Game.prototype.getHandler         = function (round, type) { return this._handlers[round][type] };
Game.prototype.getRoom            = function () { return this._room; };
Game.prototype.getStoredRand      = function () { return this._storedRand; };
Game.prototype.getActionsLimits   = function (uid) { return this._actionsLimits[uid]; };
Game.prototype.getActionsCount    = function () { return this._actionsCount; };
Game.prototype.getActionsMain     = function () { return this._actionsMain; };
Game.prototype.getCountUsers      = function () { return this._currCountInRoom; };
Game.prototype.getStoredOptions   = function () { return this._storedOptions; };
Game.prototype.getActivePlayer    = function (key) { return this._activePlayers[key]; };
Game.prototype.getActions          = function (key) { return this._actionsQueue[key]; };

Game.prototype.clearPrison        = function () { this._prisoner = null; };
Game.prototype.setOnStart         = function (func) { this._onStart = func; };
Game.prototype.setStoredRand      = function (val) { this._storedRand = val; };
Game.prototype.setActionsCount    = function (val) { this._actionsCount = val; };
Game.prototype.setActionsMain     = function (val) { this._actionsMain = val; };
Game.prototype.setCountUsers      = function (val) { this._currCountInRoom = val; };
Game.prototype.setStoredOptions   = function (val) { this._storedOptions = val; };
Game.prototype.clearActivePlayers = function () { this._activePlayers = {} };
Game.prototype.setNextGame        = function (val) { this._nextGame = val; };
Game.prototype.clearActionsQueue  = function () { this._actionsQueue = {} };
Game.prototype.setActivePlayer    = function (key, val) { this._activePlayers[key] = val; };
Game.prototype.setGameState       = function (val) { this._gameState = val; };
Game.prototype.setOnGame          = function (func) { this._onGame = func; };
Game.prototype.saveActionsQueue   = function () { this._storedOptions = this._actionsQueue; };
Game.prototype.setPrisoner        = function (val) { this._prisoner = val; };
Game.prototype.clearTimer         = function () { if(this._timer) { clearTimeout(this._timer); } };
Game.prototype.sendRoomInfo = function (socket, options) { if( this._onGame) {  this._onGame(socket, options); } };
Game.prototype.setProtection      = function (key, val) { this._prisonProtection[key] = val; };
Game.prototype.getPrisonProtection = function (key) { return this._prisonProtection[key]; };

Game.prototype.start                  = start;
Game.prototype.stop                   = stop;
Game.prototype.sendData               = sendData;
Game.prototype.addEmits               = addEmits;

Game.prototype.getPlayersID           = getPlayersId;
Game.prototype.getPlayerInfo          = getPlayerInfo;
Game.prototype.getActivePlayers       = getActivePlayers;
Game.prototype.getActivityRating      = getActivityRating;
Game.prototype.checkCountPlayers      = checkCountPlayers;

Game.prototype.setActionLimit         = setActionLimit;
Game.prototype.activateAllPlayers     = activateAllPlayers;
Game.prototype.startTimer             = startTimer;
Game.prototype.selectNextPlayer       = selectNextPlayer;
Game.prototype.checkPrisoner          = checkPrisoner;
Game.prototype.addAction              = addAction;
Game.prototype.removeProtection       = removeProtection;
Game.prototype.addPoints              = addPoints;

module.exports = Game;