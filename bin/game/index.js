var constants      = require('./constants');

var start          = require('./lib/start'),
    stop           = require('./lib/stop'),
    emit           = require('./lib/emit'),
    getGameState   = require('./lib/get_game_state'),
    restoreGame    = require('./lib/restore_game');

var hStart         = require('./lib/handlers/h_start'),
    hLot           = require('./lib/handlers/h_lot'),
    hBottle        = require('./lib/handlers/h_bottle'),
    hBottleKisses  = require('./lib/handlers/h_bottle_kisses'),
    hQuestions     = require('./lib/handlers/h_questions'),
    hCards         = require('./lib/handlers/h_cards'),
    hBest          = require('./lib/handlers/h_best'),
    hSympathy      = require('./lib/handlers/h_sympathy'),
    hSympathyShow  = require('./lib/handlers/h_sympathy_show');


/**
 * Класс Игра
 * @param room
 * @constructor
 * Метод start запускает игру, выполняетя обработчик start, котоырй дает клиентам команду показать волчек
 *       и назначает ведущего игрока
 * Далее игра реагирует на вызовы клиентов запуская один обработчик за другим согласно логики игры
 * Метод emit вызвает событие игры у клиентов
 * Если не все игроки сделали свой ход за установленное время, обработчик срабатывает автоматически
 * Метод stop останавливает игру и сбрасывает у всех играков флаги готовности к игре
 */
function Game(room) {
  var self = this;
  this.gRoom = room;                 // Стол этой игры

  this.gActionsQueue = {};          // Очередь действий игроков
  this.gActionsLimits = {};         // Лимиты ответов для игроков
  this.gActionsCount = 0;            // Количество ответов до перехода к следующей игре

  this.gStoredOptions  = {};        // опции, сохраненные на предидущих этапах
  this.gActivePlayers  = {};       // Игроки, которые на данном этапе могут ходить
  this.gNextGame = constants.G_START; // Игра, которая будет вызвана следующей

  this.gTimer = null;       // Таймер, ограничивает время действия игроков, вызвывает следующую игру

  this.gameState = null;

  this.gHandlers = {};           // Обработчики игр
  this.gHandlers[constants.G_START]         = hStart(self);
  this.gHandlers[constants.G_LOT]           = hLot(self);
  this.gHandlers[constants.G_BOTTLE]        = hBottle(self);
  this.gHandlers[constants.G_BOTTLE_KISSES] = hBottleKisses(self);
  this.gHandlers[constants.G_QUESTIONS]     = hQuestions(self);
  this.gHandlers[constants.G_CARDS]         = hCards(self);
  this.gHandlers[constants.G_BEST]          = hBest(self);
  this.gHandlers[constants.G_SYMPATHY]      = hSympathy(self);
  this.gHandlers[constants.G_SYMPATHY_SHOW] = hSympathyShow(self);

  this.gStoredRand = 5;
}

Game.prototype.start = start;
Game.prototype.stop = stop;
Game.prototype.emit = emit;
Game.prototype.getGameState = getGameState;
Game.prototype.restoreGame = restoreGame;
//Game.prototype.isPlayerInRoom = isPlayerInRoom;
//Game.prototype.getPlayerInfo = getPlayerInfo;

module.exports = Game;
