var stagesInit = [ 'bottle_init', 'questions_init', 'cards_init', 'best_init', 'sympathy_init'];
var gameQuestions = [];

var CARD_COUNT = 10;

function Game(socket, room, users) {
 var gUsers = users;
 var gRoom = room;
 var gSocket = socket;
 var nextStage = 'lot_init';
 var actionsQueue = {};
 var gMonitoring = null;
 var currPlayers  = {};

 setComplete(gSocket, gUsers);
 addAction(gSocket, actionsQueue);
}

// Начать игру
Game.prototype.start = function() {
 this.gMonitoring = this.monitorStages();
};

// Остановить игру и сбросить флаги готовности к игре у всех игроков
Game.prototype.stop = function() {
 clearInterval(this.gMonitoring);

 var guys = room.guys;
 var girls = room.girls;

 for (guy in guys) {
   guys[guy].setReady(false);
 }
 for (girl in girls) {
   girls[girl].setReady(false);
 }
};

// Сменить сцену всем игрокам
Game.prototype.emit = function(stage, options) {
    this.gSocket.broadcast.to(this.gRoom.name).emit(stage, options);
};

/*
Метод периодически проверяет: готова ли сцена у всех игроков и все ли игроки сделали ход
- В этом случае переходим к следующей стадии игры, меняем всем сцену и назначаем ход определенным игрокам
- а так же сообщаем итоги предидущей стадии игры
 */
Game.prototype.monitorStages = function() {
 var self = this;
 return setInterval(function() {
   if(checkComplete(self.room) || checkActions(self.currPlayers, self.actionsQueue)) {
     var options;
     var player;
     var ns = self.nextStage;
     var players = self.currPlayers;

     if (ns == 'lot_init') { // Волчек начало - делаем приоизвольного игрока ведущим
       player = randomPlayer(self.gRoom, null);
       players = [];
       players.push(player);

       options = {players: player.getID()};
       self.emit(ns, options);
       ns = 'lot_result';
     }
     if (ns == 'lot_result') { // Волчек конец - выбираем произовльную игру
       var rand = randomInteger(0, stagesInit.length - 1);
       options = {game: stagesInit[rand]};
       self.emit(ns, options);
       ns = stagesInit[rand];
     }
     if (ns == 'bottle_init') { // Бутылока начало - крутивший волчек крутит и бутылочку
       options = {players: player.getID()};
       self.emit(ns, options);
       ns = 'bottle_kisses';
     }
     if (ns == 'bottle_kisses') { // Бутылочка поцелуи - подбираем крутившему бутылочку пару
       var firstGender = players[0].getGender();
       var secondGender = (firstGender == 'guy') ? 'girl' : 'guy';
       player = randomPlayer(self.gRoom, secondGender);
       players.push(player);
       options = {players: [players[0].getID(), players[1].getID()]};

       socket.emit(ns, options);
       ns = 'bottle_result';
     }
     if (ns == 'bottle_result') { // Бутылочка конец - показываем всем, кто кого поцеловал
       options = {};
       for (var i = 0; i < players.length; i++) {
         options[players[i].getID()] = self.actionsQueue[self.currPlayer[i].getID()];
       }
       self.emit(ns, options);
       ns = 'lot_init';
       players = [];
     }
     if (ns == 'questions_init') { // Вопропсы начало - играют все, подбираем приозвольный вопрос
       players = [];
       pushAllPlayers(self.gRoom, players);
       var rand = randomInteger(0, gameQuestions.length - 1);
       options = {question: gameQuestions[rand]};
       self.emit(ns, options);
       ns = 'questions_result';
     }
     if (ns == 'questions_result') { // Воросы конец - показываем все ответы
       options = {};
       for (var i = 0; i < players.length; i++) {
         options[players[i].getID()] = self.actionsQueue[players[i].getID()];
       }
       self.emit(ns, options);
       ns = 'lot_init';
       players = [];
     }
     if (ns == 'cards_init') { // Карты начало - играют все

       pushAllPlayers(self.gRoom, players);
       self.emit(ns, null);
       ns = 'cards_result';
     }
     if (ns == 'cards_result') { // Карты конец - призвольно делаем одну карту золотой и сообщаем всем результаты
       options = { card: null, players : {} };
       for (var i = 0; i < players.length; i++) {
         options.players[players[i].getID()] = self.actionsQueue[players[i].getID()];
       }

       options.card = randomInteger(0, CARD_COUNT-1);

       self.emit(ns, options);
       ns = 'lot_init';
       players = [];
     }
     if (ns == 'best_init') { // Лучший начало - играют все, выбираем крутившему волчек произвольно пару одного пола
       player = randomPlayer(self.gRoom, players[0].getGender());
       options = {};
       var arr = [];
       arr.push(players[0].getID());
       arr.push(player.getID());
       options['players'] = arr;

       players = [];
       pushAllPlayers(self.gRoom, players);
       self.emit(ns, options);
       ns = 'best_result';
     }
     if (ns == 'best_result') { // Лучший конец - показываем всем их выбор
       options = {};
       for (var i = 0; i < players.length; i++) {
         options[players[i].getID()] = self.actionsQueue[players[i].getID()];
       }
       players = [];
       self.emit(ns, options);
       ns = 'lot_init';
     }
     if (ns == 'sympathy_init') { // Симпатия начало - играют все
       players = [];
       pushAllPlayers(self.gRoom, players);
       self.emit(ns, null);
       ns = 'sympathy_result';
     }
     if (ns == 'sympathy_result') { // Симпатия конец - показываем всем их выбор
       options = {};
       for (var i = 0; i < players.length; i++) {
         options[players[i].getID()] = self.actionsQueue[players[i].getID()];
       }
       self.emit(ns, options);
       ns = 'lot_init';
       players = [];
     }

     clearComplete(self.gRoom);
     self.actionsQueue = {};
    } // Проверки
 }, 30); // Таймер
};

module.exports = Game;

// Установить готовность по текущей стадии игры
function setComplete(socket, users) {
  socket.on('complete', function() {
    users[socket.id].setComplete();
  })
}

// Добавить ход игрока в очередь для обработки
function addAction(socket) {
  socket.on('action', function(players, queue, options) {
    var profile = players[socket.id];
    if(!queue[profile.getID()])
      queue[profile.getID()] = options;
  });
}

// Проверить готовность всех игроков по текущей стадии
function checkComplete(room) {
 var allComplete = true;
 var guys = room.guys;
 var girls = room.girls;

 for (guy in guys) {
   if(!guys[guy].getComlete()) allComplete = false;
 }

 for (girl in girls) {
   if(!girls[girl].getComlete()) allComplete = false;
 }

 return allComplete;
}

// Проверить, все ли игроки ходили
function checkActions(players, queue) {
    var allComplete = true;
    for(var i = 0; i < players.length; i++) {
        if(!queue[players[i].getID()]) allComplete = false;
    }
    return allComplete;
}

// Очистить готовность всех игроков по стадиям
function clearComplete(room) {
 var guys = room.guys;
 var girls = room.girls;

 for (guy in guys) {
   guys[guy].setComlete(false);
 }

 for (girl in girls) {
   girls[girl].setComlete(false);
 }
}


// Выбрать произвольного игрока
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

// Ожидать хода ото всех играков
function pushAllPlayers(room, players) {
 var guys = room.guys;
 var girls = room.girls;

 for (guy in guys) {
     players.push(guys[guy]);
 }

 for (girl in girls) {
     players.push(girls[girl]);
 }
}

function randomInteger(min, max) {
 var rand = min - 0.5 + Math.random() * (max - min + 1);
 rand = Math.round(rand);
 return rand;
}