var addAction      = require('./lib/add_action');

var start          = require('./lib/start'),
    stop           = require('./lib/stop'),
    emit           = require('./lib/emit');

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
 * @param socket
 * @param room
 * @param ul
 * @constructor
 * Метод start запускает игру, выполняетя обработчик start, котоырй дает клиентам команду показать волчек
 *       и назначает ведущего игрока
 * Далее игра реагирует на вызовы клиентов запуская один обработчик за другим согласно логики игры
 * Метод emit вызвает событие игры у клиентов
 * Если не все игроки сделали свой ход за установленное время, обработчик срабатывает автоматически
 * Метод stop останавливает игру и сбрасывает у всех играков флаги готовности к игре
 */
function Game(socket, room, ul) {
  var self = this;
  this.userList = ul;
  this.gRoom = room;            // Стола этой игры
  this.gSocket = socket;        // Сокет

  this.actionsQueue = {};       // Очередь действий игроков
  this.answersLimits = {};
  this.storedOptions  = {};     // опции, сохраненные на предидущих этапах
  this.currPlayers  = {};       // Игроки, которые на данном этапе могут ходить
  this.nextGame = 'start';      // Игра, которая будет вызвана следующей
  this.currTimer = null;        // Таймер, ограничивает время действия игроков, вызвывает следующую игру
  this.countActions = 0;        // Количество действий до перехода к следующей игре

  //addAction(self, socket);

  this.handlers = { // Обработчики игр
    start         : hStart(self),
    lot           : hLot(self),
    bottle        : hBottle(self),
    bottle_kisses : hBottleKisses(self),
    questions     : hQuestions(self),
    cards         : hCards(self),
    best          : hBest(self),
    sympathy      : hSympathy(self),
    sympathy_show : hSympathyShow(self)
  };
}

Game.prototype.start = start;
Game.prototype.stop = stop;
Game.prototype.emit = emit;

module.exports = Game;
