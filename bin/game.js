var validator = require('validator');
var GameError = require('./bin/game_error');

var GAMES = [ 'bottle', 'questions', 'cards', 'best', 'sympathy'];
var GAME_QUESTIONS = [];
var TIMEOUT = 15;
var CARD_COUNT = 10;
var PLAYERS_COUNT = 10;

/**
 * Класс Игра
 * @param socket
 * @param room
 * @param users
 * @constructor
 * Метод start запускает игру, выполняетя обработчик start, котоырй дает клиентам команду показать волчек
 *       и назначает ведущего игрока
 * Далее игра реагирует на вызовы клиентов запуская один обработчик за другим согласно логики игры
 * Метод emit вызвает событие игры у клиентов
 * Если не все игроки сделали свой ход за установленное время, обработчик срабатывает автоматически
 * Метод stop останавливает игру и сбрасывает у всех играков флаги готовности к игре
 */
function Game(socket, room, users) {
  var self = this;
  var userList = users;
  var gRoom = room;            // Стола этой игры
  var gSocket = socket;        // Сокет
  var actionsQueue = {};       // Очередь действий игроков
  var currPlayers  = [];       // Игроки, которые в данный момент могут влиять на игру
  var nextGame = 'start';      // Игра, которая будет вызвана следующей
  var currTimer;               // Таймер, ограничивает время действия игроков, вызвывает следующую игру
  var countActions = 0;        // Количество действий до перехода к следующей игре

  addAction(this);

  var handlers = {             // Обработчики игр
    start: function() {        // Начальный этап с волчком, все игроки должны сделать вызов, после чего
      if(countActions == 0) {  // выбираем произвольно одного из них и переходим к розыгышу волчка
        clearTimeout(currTimer);
        var player = randomPlayer(gRoom, null);
        currPlayers = [];
        currPlayers.push(player);
        actionsQueue = {};

        countActions = 1;
        nextGame = 'lot';

        var options = {players: getPlayersID(currPlayers)};
        self.emit(options);
        currTimer = startTimer(handlers[nextGame], countActions);
      }
    }, // Волчек, выбираем произвольно игру  и задаем ее начальные опции
    lot : function() {
      clearTimeout(currTimer);
      var rand = randomInteger(0, GAMES.length - 1);
      nextGame = GAMES[rand];

      actionsQueue = {};

      var options = { game : nextGame };
      if(nextGame == 'bottle') {  // для бутылочки ходит тот же, кто крутил вочек
        countActions = 1;
        options[players] =  getPlayersID(currPlayers);
        self.emit(options);
      }
      if(nextGame == 'questions') { // для вопросов ходят все, отвечая на произовльный вопрос
        currPlayers = [];
        countActions = PLAYERS_COUNT;
        pushAllPlayers(gRoom, currPlayers);
        var rand = randomInteger(0, GAME_QUESTIONS.length - 1);
        options['question'] =  GAME_QUESTIONS[rand];
        options['players'] = getPlayersID(currPlayers);
        self.emit(options);
      }
      if(nextGame == 'cards') { // для карт ходят все
        currPlayers = [];
        countActions = PLAYERS_COUNT;
        pushAllPlayers(gRoom, currPlayers);
        options['players'] = getPlayersID(currPlayers);
        self.emit(options);
      }
      if(nextGame == 'best') { // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходя остальные
        var player = randomPlayer(gRoom, currPlayers[0].getGender());
        var arr = [];
        arr.push(currPlayers[0].getID());
        arr.push(player.getID());

        countActions = PLAYERS_COUNT-2;
        pushAllPlayers(gRoom, currPlayers, arr);
        options['players'] = getPlayersID(currPlayers);
        options['best'] = arr;
        self.emit(options);
      }
      if(nextGame == 'sympathy') { // для игры "симпатия" ходят все
        countActions = PLAYERS_COUNT;
        pushAllPlayers(gRoom, currPlayers);
        options['players'] = getPlayersID(currPlayers);
        self.emit(options);
      }
      currTimer = startTimer(actions[nextGame], countActions);
    },
    bottle : function() { // Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
      var firstGender = currPlayers[0].getGender();
      var secondGender = (firstGender == 'guy') ? 'girl' : 'guy';
      var player = randomPlayer(gRoom, secondGender);
      currPlayers.push(player);
      nextGame = 'bottle_kisses';
      countActions = 2;
      actionsQueue = {};

      var options = {};
      options['players'] = getPlayersID(currPlayers);
      self.emit(options);

      currTimer = startTimer(handlers[nextGame], countActions);
    },
    bottle_kisses : function(id, opt) { // Бутылочка поцелуи, сообщаем всем выбор пары
      if(!validator.isBoolean(opt.kiss)) {
        self.stop();
        new GameError(gSocket, 'GAMEBOTTLE', "Неверные агрументы");
      }
      var options = {};
      options['kiss'] = { id : id, pick : opt.kiss};
      self.emit(options);

      if(countActions == 0) {
        nextGame = 'start';
        actionsQueue = {};
        currPlayers = [];
        pushAllPlayers(gRoom, currPlayers);

        countActions = PLAYERS_COUNT;
        currTimer = startTimer(handlers[nextGame], countActions);
      }
    },
    questions : function() { // Вопросы, ждем, когда все ответят, потом показываем всем ответы
      if(countActions == 0) {
        var options = { answers : [] };
        for (var i = 0; i < currPlayers.length; i++) {
          var id = currPlayers[i].getID();
          var answer = actionsQueue[id];
          if(answer[0].pick != '1' || answer[0].pick != '2' || answer[0].pick != '3')  {
              self.stop();
              return new GameError(gSocket, 'GAMEQUESTIONS', "Неверные агрументы");
          }
          options.answers.push({ id : id, pick : answer[0] });
        }
        self.emit(options);

        nextGame = 'start';
        currPlayers = [];
        actionsQueue = {};
        pushAllPlayers(gRoom, currPlayers);
        countActions = PLAYERS_COUNT;
        currTimer = startTimer(handlers[nextGame], countActions);
      }
    },
    cards : function() { // Карты, ждем, кода все ответят, потом показываем всем их ответы и где золото
      if(countActions == 0) {
        var options = {picks : []};
        for (var i = 0; i < currPlayers.length; i++) {
          var id = currPlayers[i].getID();
          var answer = actionsQueue[id];
          if(!validator.isNumeric(answer[0] || answer < 0 || answer > 9 ))  {
             self.stop();
              return new GameError(gSocket, 'GAMECARDS', "Неверные агрументы");
          }
          options.picks.push({ id : id, pick : answer });
        }
        options.gold = randomInteger(0, CARD_COUNT-1);

        self.emit(options);

        nextGame = 'start';
        currPlayers = [];
        pushAllPlayers(gRoom, currPlayers);
        actionsQueue = {};
        countActions = PLAYERS_COUNT;
        currTimer = startTimer(handlers[nextGame], countActions);
      }
    },
    best : function(id, opt) { // Лучший, сообщаем всем их выбор
      var options = {};
      if(!gRoom.guys(opt.pick) && !gRoom.girls(opt.pick)) {
          self.stop();
          return new GameError(gSocket, 'GAMEBEST', "Неверные агрументы");
      }
      options['pick'] = { id : id, pick : opt.pick};
      self.emit(options);

      if(countActions == 0) {

        nextGame = 'start';
        currPlayers = [];
        pushAllPlayers(gRoom, currPlayers);
        actionsQueue = {};
        countActions = PLAYERS_COUNT;
        currTimer = startTimer(handlers[nextGame], countActions);
      }
    },
    sympathy : function() { // Симпатии, ждем, когда все ответят и переходим к показу результатов
      if(countActions == 0) {
        var options = { complete : true };

        self.emit(options);

        nextGame = 'sympathy_show';
        currPlayers = [];
        pushAllPlayers(gRoom, currPlayers);
        actionsQueue = {};
        countActions = PLAYERS_COUNT * PLAYERS_COUNT;
        currTimer = startTimer(handlers[nextGame], countActions);
      }
    },
    sympathy_show : function(id, opt) { // Показываем желающим выбор указанного ими игрока
      var options = {};
      for(var i = 0; i < actionsQueue[id].length; i ++) {
          var uid = actionsQueue[id][i];
          if(!gRoom.guys[uid] && !gRoom.girls[uid]) {
              self.stop();
              return new GameError(gSocket, 'GAMESYMPATHY', "Неверные агрументы");
          }
      }

      options['pick'] = { id : opt.id, pick : actionsQueue[id]};
      self.emit(options, id);

      if(countActions == 0) {

        nextGame = 'start';
        currPlayers = [];
        pushAllPlayers(gRoom, currPlayers);
        actionsQueue = {};
        countActions = PLAYERS_COUNT;
        currTimer = startTimer(handlers[nextGame], countActions);
      }
    }
  };
}
////////////////////////// МЕТОДЫ КЛАССА ИГРА  //////////////////////////////////////
// Начать игру
Game.prototype.start = function() {
 this.actions.start();
};
//////////////////////////////////////////////////////////////////////////////////////////
// Остановить игру и сбросить флаги готовности к игре у всех игроков
Game.prototype.stop = function() {
 clearTimeout(this.currTimer);

 var guys = room.guys;
 var girls = room.girls;

 for (guy in guys) {
   guys[guy].setReady(false);
 }
 for (girl in girls) {
   girls[girl].setReady(false);
 }
};
//////////////////////////////////////////////////////////////////////////////////////////
// Вызвать эмиты у клиентов
Game.prototype.emit = function(options, one) {
 if(one) {
   this.gSocket.emit(options);
 } else {
   this.gSocket.broadcast.to(this.gRoom.name).emit(stage, options);
 }
};

module.exports = Game;
////////////////////////// ЭМИТТЕРЫ //////////////////////////////////////////////////////
// Добавить ход игрока в очередь для обработки
function addAction(game) {
 game.gSocket.on('action', function(options) {
   var profile = game.userList[game.gSocket.id];
   if(game.currPlayers[profile.getID()]) {
     if(!game.actionsQueue[profile.getID()]) {
       game.actionsQueue[profile.getID()] = [];
     }
     game.actionsQueue[profile.getID()].push(options);
     game.countActions--;
     game.handlers[game.nextGame](profile.getID(), options);
   }
 });
}

//////////////////////////////// СЛУЖЕБЫНЕ ФУНКЦИИ ////////////////////////////////////////////
// Выбрать произвольного игрока любого, или указанного пола
function randomPlayer(room, gen) {
 var guys = room.guys;
 var girls = room.girls;
 var allPlayers = [];
 var gender = gen || '';

 if(gender == '' || gender == 'guy')   {
   for (guy in guys) {
     allPlayers.push(guys[guy]);
   }
 }

 if(gender == '' || gender == 'girl') {
   for (girl in girls) {
     allPlayers.push(girls[girl]);
   }
 }

 var rand = randomInteger(0, allPlayers.length-1);
 return allPlayers[rand];
}

// Ожидать хода ото всех играков (поместить их в список текущих игроков)
function pushAllPlayers(room, players, withoutid) {
 var guys = room.guys;
 var girls = room.girls;

 for (guy in guys) {
   players.push(guys[guy]);
 }

 for (girl in girls) {
   players.push(girls[girl]);
 }

 for(var i = 0; i < withoutid.length; i++) {
   var index = players.indexOf(withoutid[i]);
   if (index != -1) players.splice(index, 1);
 }
}

// Зарустить таймер, по истечении которого будет выполнен заданный обработчик игры
function startTimer(func, count) {
 return setTimeout(function() {
   count = 0;
   func();
 }, TIMEOUT * 1000);
}

// Собрать в массив ИД всех играков в списке
function getPlayersID(players) {
 var arr = [];
 for(var i = 0; i < players.length; i++) {
   arr.push(players[i].getID());
 }
 return arr;
}

// Получить случайное число из диапазона
function randomInteger(min, max) {
 var rand = min - 0.5 + Math.random() * (max - min + 1);
 rand = Math.round(rand);
 return rand;
}

