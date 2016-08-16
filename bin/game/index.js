var constants             = require('../constants');

var logger = require('./../../lib/log');

var start                 = require('./lib/start'),
    stop                  = require('./lib/stop'),
    emit                  = require('./lib/emit'),
    getGameState          = require('./lib/get_game_state'),
    restoreGame           = require('./lib/restore_game'),
    setActionLimit        = require('./lib/set_action_limits'),
    activateAllPlayers    = require('./lib/activate_all_players'),
    getRandomPlayer       = require('./lib/random_player'),
    getPlayersId          = require('./lib/get_players_id'),
    startTimer            = require('./lib/start_timer'),
    isPlayerInRoom        = require('./lib/is_player_in_room'),
    getRandomQuestion     = require('./lib/get_random_question'),
    getPlayerInfo         = require('./lib/get_player_info'),
    getNextPlayer         = require('./lib/get_next_player'),
    checkCountPlayers     = require('./lib/check_count_players'),
    getPrisonerInfo       = require('./lib/get_prisoner_info'),
    clearPrison           = require('./lib/clear_prison');

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

var db                    = require('./../db/index.js'),
  dbManager = new db();

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

function Game(room, userList) {
  var self = this;

  this.gRoom = room;                  // Стол этой игры
  this.userList = userList;

  this.gActionsQueue  = {};           // Очередь действий игроков
  this.gActionsLimits = {};           // Лимиты ответов для игроков
  this.gActionsCount  = 0;            // Количество ответов до перехода к следующей игре

  this.gStoredOptions  = {};          // опции, сохраненные на предидущих этапах
  this.gActivePlayers  = {};          // Игроки, которые на данном этапе могут ходить
  this.gPrisoner = null;              // Игрок в темнице

  this.gNextGame = constants.G_START; // Игра, которая будет вызвана следующей

  this.gTimer = null;                 // Таймер, ограничивает время действия игроков, вызвывает следующую игру

  this.gameState = null;              // Состояние игры (отпавляется игроку в случае разрыва соединения)

  this.girlsIndex = 0;                // Индекс игарющей девушки
  this.guysIndex = 0;                 // и парня
  this.currentSex = 1;                // текущий пол

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
  this.gHandlers[constants.G_PRISON]        = hPrison(self);
}

Game.prototype.start                  = start;
Game.prototype.stop                   = stop;
Game.prototype.emit                   = emit;
Game.prototype.restoreGame            = restoreGame;

Game.prototype.getGameState           = getGameState;
Game.prototype.getPlayersID           = getPlayersId;
Game.prototype.isPlayerInRoom         = isPlayerInRoom;
Game.prototype.getRandomQuestion      = getRandomQuestion;
Game.prototype.getPlayerInfo          = getPlayerInfo;
Game.prototype.getRandomPlayer        = getRandomPlayer;
Game.prototype.checkCountPlayers      = checkCountPlayers;
Game.prototype.getPrisonerInfo        = getPrisonerInfo;

Game.prototype.setActionLimit         = setActionLimit;
Game.prototype.activateAllPlayers     = activateAllPlayers;
Game.prototype.startTimer             = startTimer;
Game.prototype.getNextPlayer          = getNextPlayer;
Game.prototype.clearPrison            = clearPrison;

// Получаем вопросы
Game.prototype.getQuestions = function() {
  return gameQuestions;
};

getQuestionsFromDB();

// --------------------
function getQuestionsFromDB() {
  dbManager.findAllQuestions(function(err, questions) {
    if(err) {
      return logger.error(400, "Ошибка при получении вопросов из базы данных");
       //console.log("Ошибка при получении вопросов из базы данных");
    }

    gameQuestions = questions;

    setTimeout(function(){ getQuestionsFromDB()}, constants.QUESTIONS_TIMEOUT);
  });
}