/**
 * Класс Игра, стартует, когда набирается достаточное количество игроков и отанавливается, когди их меньше
 * С заданной периодичностью запускает случайную игру из списка, обрабатывает действия игроков, начисляет
 * призовые очки и монеты
 *
 * @param room
 * @constructor
 */

const  logger = require('./../../lib/log')(module);
const  constants             = require('../constants');

const loadGameQuestions = require('./../load_game_questions');

// Методы
const start                 = require('./lib/main/start');
const stop                  = require('./lib/main/stop');
const emit                  = require('./lib/emits/emit');
const setActionLimit        = require('./lib/common/set_action_limits');
const activateAllPlayers    = require('./lib/common/activate_all_players');
const getPlayersId          = require('./lib/common/get_players_id');
const startTimer            = require('./lib/common/start_timer');
const getRandomQuestion     = require('./lib/common/get_random_question');
const getPlayerInfo         = require('./lib/common/get_player_info');
const getNextPlayer         = require('./lib/common/get_next_player');
const checkCountPlayers     = require('./lib/common/check_count_players');
const addEmits              = require('./lib/emits/add_emits');
const getActivityRating     = require('./lib/common/get_activity_rating');
const checkPrisoner         = require('./lib/common/check_prisoner');

const finishBest      = require('./lib/handlers/finishers/f_best');
const finishBottle    = require('./lib/handlers/finishers/f_bottle');
const finishBottleKisses = require('./lib/handlers/finishers/f_bottle_kisses');
const finishCards     = require('./lib/handlers/finishers/f_cards');
const finishLot       = require('./lib/handlers/finishers/f_lot');
const finishPause     = require('./lib/handlers/finishers/f_pause');
const finishPrison    = require('./lib/handlers/finishers/f_prison');
const finishQuestions = require('./lib/handlers/finishers/f_questions');
const finishSympathy  = require('./lib/handlers/finishers/f_sympathy');
const finishSympathyShow = require('./lib/handlers/finishers/f_sympathy_show');

const startBest       = require('./lib/handlers/starters/s_best');
const startBottle     = require('./lib/handlers/starters/s_bottle');
const startBottleKisses = require('./lib/handlers/starters/s_bottle_kisses');
const startCards      = require('./lib/handlers/starters/s_cards');
const startLot        = require('./lib/handlers/starters/s_lot');
const startPause      = require('./lib/handlers/starters/s_pause');
const startPrison     = require('./lib/handlers/starters/s_prison');
const startQuestions  = require('./lib/handlers/starters/s_questions');
const startSympathy   = require('./lib/handlers/starters/s_sympathy');
const startSympathyShow = require('./lib/handlers/starters/s_sympathy_show');

loadGameQuestions(function (err) {
  if(err) {
    logger.error(400, "Ошибка при получении вопросов из базы данных");
  }
});

function Game(room) {
  
  this._isActive = false;             // Флаг - игра запущена или нет

  this._room = room;                  // Комната, которй принадлежить эта игра
  
  this._storedRand    = null;         // Предидущий выбор игры (чтобы подряд не повторялся)

  this._actionsQueue  = {};           // Очередь действий игроков
  this._actionsLimits = {};           // Лимиты ответов для игроков
  this._actionsCount  = 0;            // Текущее количество ответов до перехода к следующей игре
  this._actionsMain   = 0;            // Общее количество ответов до перехода к следующей игре
  
  this._currCountInRoom = 0;          // Количество игроков в комнате на начало текущего раунда

  this._storedOptions  = {};          // опции, сохраненные на предидущих этапах
  this._activePlayers  = {};          // Игроки, которые на данном этапе могут ходить
  this._prisoner = null;              // Игрок в темнице

  this._nextGame = null;              // Игра, которая будет вызвана следующей

  this._timer = null;                 // Таймер, ограничивает время действия игроков, вызвывает следующую игру

  this._gameState = null;             // Состояние игры (отпавляется игроку в случае разрыва соединения)

  this._girlsIndex = 0;               // Индекс играющей девушки
  this._guysIndex = 0;                // и парня
  this._currentSex = 1;               // текущий пол
  
  this._onStart = null;               // Срабатывает при старте очередного раунда и при остановке
  this._onGame = null;                // Обработка хода игрока
  
  this._handlers = {
    starters : {
      startBest : startBest,
      startBottle : startBottle,
      startCards : startCards,
      startLot : startLot,
      startPause : startPause,
      startPrison : startPrison,
      startQuestions : startQuestions,
      startSympathy : startSympathy
    },
    finishers : {
      finishBest : finishBest,
      finishBottle : finishBottle,
      finishCards : finishCards,
      finishLot : finishLot,
      finishPause : finishPause,
      finishPrison :finishPrison,
      finishQuestions : finishQuestions,
      finishSympathy : finishSympathy
    }
  }
}

Game.prototype.getGameState     = function () { return this._gameState; };
Game.prototype.getPrisonerInfo  = function () { return this._prisoner; };
Game.prototype.isActive         = function () { return this._isActive; };
Game.prototype.getNextGame      = function () { return this._nextGame; };

Game.prototype.clearPrison      = function () { this._prisoner = null; };
Game.prototype.setOnStart       = function (func) { this._onStart = func; };

Game.prototype.start                  = start;
Game.prototype.stop                   = stop;
Game.prototype.emit                   = emit;

Game.prototype.getPlayersID           = getPlayersId;
Game.prototype.getRandomQuestion      = getRandomQuestion;
Game.prototype.getPlayerInfo          = getPlayerInfo;
Game.prototype.checkCountPlayers      = checkCountPlayers;

Game.prototype.setActionLimit         = setActionLimit;
Game.prototype.activateAllPlayers     = activateAllPlayers;
Game.prototype.startTimer             = startTimer;
Game.prototype.getNextPlayer          = getNextPlayer;
Game.prototype.addProfile             = addEmits;
Game.prototype.getActivityRating      = getActivityRating;
Game.prototype.checkPrisoner          = checkPrisoner;

module.exports = Game;