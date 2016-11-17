var constants             = require('../constants');
var db = require ('./../db_manager');

var logger = require('./../../lib/log')(module);

var start                 = require('./lib/start'),
    stop                  = require('./lib/stop'),
    emit                  = require('./lib/emit'),
    restoreGame           = require('./lib/restore_game'),
    setActionLimit        = require('./lib/common/set_action_limits'),
    activateAllPlayers    = require('./lib/common/activate_all_players'),
    getPlayersId          = require('./lib/common/get_players_id'),
    startTimer            = require('./lib/common/start_timer'),
    getRandomQuestion     = require('./lib/common/get_random_question'),
    getPlayerInfo         = require('./lib/common/get_player_info'),
    getNextPlayer         = require('./lib/common/get_next_player'),
    checkCountPlayers     = require('./lib/common/check_count_players');

var hStart                  = require('./lib/handlers/h_start'),
    hLot                    = require('./lib/handlers/h_lot'),
    hBottle                 = require('./lib/handlers/h_bottle'),
    hBottleKisses           = require('./lib/handlers/h_bottle_kisses'),
    hQuestions              = require('./lib/handlers/h_questions'),
    hCards                  = require('./lib/handlers/h_cards'),
    hBest                   = require('./lib/handlers/h_best'),
    hSympathy               = require('./lib/handlers/h_sympathy'),
    hSympathyShow           = require('./lib/handlers/h_sympathy_show'),
    hPrison                 = require('./lib/handlers/h_prison');

var oPool = require('./../objects_pool');

var gameQuestions = [];
/**
 * Класс Игра
 * @param room
 * @constructor
 * Метод start запускает игру, выполняетя обработчик start, котоырй дает клиентам команду показать волчек
 *       и назначает ведущего игрока
 * Далее игра реагирует на вызовы клиентов запуская один обработчик за другим согласно логики игры
 * Метод emit вызвает событие игры у клиентов
 * Если не все игроки сделали свой ход за установленное время, обработчик срабатывает автоматически
 * Метод stop останавливает игру
 */
module.exports = Game;

function Game(room) {
  var self = this;

  this._room = room;                  // Стол этой игры

  this._actionsQueue  = {};           // Очередь действий игроков
  this._actionsLimits = {};           // Лимиты ответов для игроков
  this._actionsCount  = 0;            // Количество ответов до перехода к следующей игре

  this._storedOptions  = {};          // опции, сохраненные на предидущих этапах
  this._activePlayers  = {};          // Игроки, которые на данном этапе могут ходить
  this._prisoner = null;              // Игрок в темнице

  this._nextGame = constants.G_START; // Игра, которая будет вызвана следующей

  this._timer = null;                 // Таймер, ограничивает время действия игроков, вызвывает следующую игру

  this._gameState = null;              // Состояние игры (отпавляется игроку в случае разрыва соединения)

  this._girlsIndex = 0;                // Индекс играющей девушки
  this._guysIndex = 0;                 // и парня
  this._currentSex = 1;                // текущий пол

  this._handlers = {};           // Обработчики игр
  this._handlers[constants.G_START]         = hStart(self);
  this._handlers[constants.G_LOT]           = hLot(self);
  this._handlers[constants.G_BOTTLE]        = hBottle(self);
  this._handlers[constants.G_BOTTLE_KISSES] = hBottleKisses(self);
  this._handlers[constants.G_QUESTIONS]     = hQuestions(self);
  this._handlers[constants.G_CARDS]         = hCards(self);
  this._handlers[constants.G_BEST]          = hBest(self);
  this._handlers[constants.G_SYMPATHY]      = hSympathy(self);
  this._handlers[constants.G_SYMPATHY_SHOW] = hSympathyShow(self);
  this._handlers[constants.G_PRISON]        = hPrison(self);
}

Game.prototype.getGameState = function () {
  return this._gameState;
};

Game.prototype.clearPrison = function () {
  this._prisoner = null;
};

Game.prototype.getPrisonerInfo = function () {
  return this._prisoner;
};

Game.prototype.start                  = start;
Game.prototype.stop                   = stop;
Game.prototype.emit                   = emit;
Game.prototype.restoreGame            = restoreGame;

Game.prototype.getPlayersID           = getPlayersId;
Game.prototype.getRandomQuestion      = getRandomQuestion;
Game.prototype.getPlayerInfo          = getPlayerInfo;
Game.prototype.checkCountPlayers      = checkCountPlayers;

Game.prototype.setActionLimit         = setActionLimit;
Game.prototype.activateAllPlayers     = activateAllPlayers;
Game.prototype.startTimer             = startTimer;
Game.prototype.getNextPlayer          = getNextPlayer;

// Получаем вопросы
Game.prototype.getQuestions = function() {
  return gameQuestions;
};

Game.prototype.getNextGame = function() { return this._nextGame; };

getQuestionsFromDB();

// --------------------
function getQuestionsFromDB() {
  db.findAllQuestions(function(err, questions) {
    if(err) {
      return logger.error(400, "Ошибка при получении вопросов из базы данных");
       //console.log("Ошибка при получении вопросов из базы данных");
    }

    gameQuestions = questions;

    setTimeout(function(){ getQuestionsFromDB()}, constants.QUESTIONS_TIMEOUT);
  });
}