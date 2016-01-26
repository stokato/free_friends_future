var socketio  =  require('socket.io'),
    waterfall =  require('async-waterfall'),
    async     =  require('async');//,
    //path      =  require('path');

var viewsjs   =  require('./bin/views'),
    profilejs =  require('./bin/profile'),
    gamejs    =  require('./bin/game'),
    giftsjs   =  require('./bin/gifts'),
    dbjs = require('./bin/db.js');

var ONE_GENDER_IN_ROOM = 5;
var GUY = "guy";
var GIRL = "girl";
var LEN_ROOM_HISTORY = 5;

var io;

var db = new dbjs();

var userList = {};        // Соответствия сокетов и профилей
var roomList = {};        // Соответствия сокетов и названий комнат
var profiles = {};        // Профили пользователей по id

var countRoom = 1;
var rooms = {          // Список комнат
    room1 : {
      name: "Room1",
      guys: {},
      guys_count : 0,
      girls: {},
      girls_count: {},
      messages: []
    }
};

// Инициализатор
exports.listen = function(server, callback) {
  io = socketio.listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket, options) {

    initProfile(socket, options);

    sendPublicMessage(socket);

    exitChat(socket);

    //sendPrivateMessage(socket, userList, profiles, adminInfo);
    //var defRoom = rooms.room1;
    //enterChat(socket, profilejs, userList, roomList, defRoom, profiles, adminInfo);

    //getRoomList(socket, rooms);
    //changeRoom(socket, roomList, rooms);
    //showProfile(socket, userList,  profiles);
    //saveProfile(socket, userList);
    //startGame(socket);
    //turnGame(socket);
    //stopGame(socket);
    //makeGift(socket);
    //showTop(socket);
    //addToFriends(socket);
  });

  callback();
};
////////////////////// ИНИЦИАЛИЗАЦИЯ ////////////////////////////////////////////////////
// Создаем профиль
function initProfile(socket, options) {
  async.waterfall([ // Инициализируем профиль пользователя
    function(cb) {
      if(userList[socket.id]) { return cb(new Error("Этот клиент уже инициализирован"))}

      var profile = profilejs();
      profile.init(socket.id, options, function(err, info) {
        if(err) { return cb(err, null); }

        userList[socket.id] = profile;
        profiles[info.id]   = profile;
        cb(null, info);
      });
    }, ///////////////////////////////////////////////////////////////
    function(info, cb) { // Помещяем в комнату
      autoPlaceInRoom(socket, function(err, room) {
        if(err) { return cb(err, null); }

        cb(null, info, room);
      });
    },///////////////////////////////////////////////////////////////
    function(info, room, cb) { // Получаем данные по игрокам в комнате (для стола)
      info.guys = [];          // По парням

      for(var i = 0; i < room.guys; i++) {
        info.guys.push( {
          id     : room.guys[i].id,
          avatar : room.guys[i].avatar,
          vid    : room.guys[i].vid,
          name   : room.guys[i].name,
          age    : room.guys[i].age
        });
      }

      info.girls = [];
      for(var i = 0; i < room.girls; i++) {
        info.girls.push( {
          id     : room.girls[i].id,
          avatar : room.girls[i].avatar,
          vid    : room.girls[i].vid,
          name   : room.girls[i].name,
          age    : room.girls[i].age
        });
      }
        cb(null, info, room);
    }///////////////////////////////////////////////////////////////
  ], function(err, info, room) { // Обрабатываем ошибки, либо передаем данные клиенту
    if(err) {
      console.log(err.message);
      return socket.emit('error', err);
    }

    socket.emit('open_room', info);
    showLastMessages(socket, room);
  });
}
//////////////////////////////////////////////////////////////////////////////////////////
// Функция, помещает пользователя в комнату, в которой меньше всего до полного комплекта
function autoPlaceInRoom(socket, callback) {
  var info = userList[socket.id].getInfo();
  var room = null;
  var count = 0;
  var len = '';
  var genArr = '';
  if(info.gender == GUY) { len = 'guys_count'; genArr = 'guys';}
  else { len = 'girls_count'; genArr = 'girls';}

  for(item in roomList) {
    if(item != roomList[socket.id]) {
      var need = ONE_GENDER_IN_ROOM - item[len];
      if(need > 0 && need < count) {
        count = need;
        room = item;
      }
    }
  }
  socket.leave(roomList[socket.id].name);
  socket.join(room.name);

  room[genArr][info.id] = userList[socket.id];

  var oldRoom = roomList[socket.id];
  if(oldRoom) {
    delete oldRoom[genArr][info.id];
    oldRoom[len]--;
  }

  roomList[socket.id] = room;

  callback(null, room);
}

///////////////////// ОБМЕН СООБЩЕНИЯМИ ///////////////////////////////////////////////////////////////
// Отправка сообщения всем в комнате
function sendPublicMessage(socket) {
  socket.on('message', function(message){
    waterfall([ //////////////////////////////////////////////////////////////////////////
        function(cb) { // Проверяем, авторизирован ли пользователь и отправляем сообщение
          var profile = userList[socket.id];
          if (profile) {
            var info = userList[socket.id].getInfo();
            info['message'] = message;

            cb(null, info);
          } else {
            cb(new Error("Ошибка отправки сообщения: Такого пользователя нет на сайте"),null);
          }
        },////////////////////////////////////////////////////////////////////////////
        function(info, cb) {
          var currRoom = roomList[socket.id];
          sendInRoom(socket, currRoom, info, function(err) {
            if(err) { return cb(err, null) }

            cb(null, null);
          })
        }
    ],///////////////////////////////////////////////////////////////////////////////
    function(err) {
      if(err) {
        console.log(err.message);
        socket.emit('error', err);
      }
    });
  });
}
// Отправка приватных сообщений, они сохраняются в истории собеседников и не приходят другим в комнате
function sendPrivateMessage(socket, userList, profiles, adminInfo) {
  socket.on('private', function(message, recId) {
    var date = new Date();

    waterfall([//////////////////////////////////////////////////////////////
        function(cb) { // Проверяем, авторизирован ли пользователь и получаем его данные
          var profile = userList[socket.id];
          if (profile) {
            userList[socket.id].getInfo(function(err, info) {
              if (err) { return cb(err, null); }

              info['message'] = message;
              cb(null, info);
            });
          } else { cb(new Error("Вы не авторизированы и не можете обмениваться сообщениями"),null); }
        }, //////////////////////////////////////////////////////////////////////////////
        function(info, cb) { // Получаем данные получателя и готовим сообщение к добавлению в историю
          profiles[recId].getInfo(function(err, recipInfo) {
            if (err) { return cb(err, null); }

            var savingMessage = { // Для получателя
              username  : recipInfo.name,
              date      : date,
              companion : info.id,
              companionname : info.name,
              incoming  : true,
              text      : message
            };
            cb(null, savingMessage, info, recipInfo);
          });
        }, ///////////////////////////////////////////////////////////////////////////////
        function (savingMessage, info, recipInfo, cb) { // Сохраняем сообщение в историю получателя
          profiles[recId].addMessage(savingMessage, function(err, result) {
            if (err) { return cb(err, null); }

            savingMessage = { // Для отправителя
              username  : info.name,
              date      : date,
              companion : recipInfo.id,
              companionname : recipInfo.name,
              incoming  : false,
              text      : message
            };

            cb(null, savingMessage, info);
          });
        }, //////////////////////////////////////////////////////////////////////////////////////
        function(savingMessage, info, cb) { // Сохраняем сообщение в историю отправителя
          userList[socket.id].addMessage(savingMessage, function(err, res) {
            if (err) { cb(err, null); }

            cb(null, info);
          });
        }, //////////////////////////////////////////////////////////////////////////////////
      function(info, cb) { // Отправляем сообщения
        profiles[recId].getSocket(function(err, socketId) {
          if (err) { return cb(err, null); }

          cb(null, info, socketId);
        });
      }, /////////////////////////////////////////////////////////////////////////////////////
      function(info, socketId, cb) {
        var recipSocket = io.sockets.sockets[socketId];
        sendOne(recipSocket, info, function(err) {
          if (err) { return cb(err, null); }

          cb(null, info);
        })
      },////////////////////////////////////////////////////////////////////////////////////
      function(info, cb) {
        sendOne(socket, info, function(err) {
          if(err) { return cb(err, null); }

          cb(null, info);
        })
      }/////////////////////////////////////////////////////////////////////////////////
    ], function(err) { // Вызывается последней или в случае ошибки
      if(err) {
        console.log(err.id + " : " + err.message);
        var errInfo = { id: err.id, message: err.message };
        socket.emit('error', errInfo);
      }
    });
  });
}

// Выходим из чата
function exitChat(socket) {
  socket.on('exit', function() {
    if(!checkAutho(socket.id)) {
      socket.emit('error', new Error("Ошибка при выходе из чта: Такого пользователя нет на сайте"));
      return;
    }

    var profile = userList[socket.id];
    var room = roomList[socket.id];
    waterfall([
      ///////////////////////////////////////////////////////////////////////////////////
      function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
        var info = profile.getInfo();

        socket.broadcast.to().emit('offline', info.id);

        cb(null, info);
      }, ///////////////////////////////////////////////////////////////////////////////////////
      function (info, cb) { // сохраняем профиль в базу
        profile.save(function(err, res) {
          if (err) { return cb(err, null); }
          cb(null, info);
        });
      }, /////////////////////////////////////////////////////////////////////////////////////
      function (info, cb) { // удалеяем профиль и сокет из памяти
        delete userList[socket.id];

        var len = '';
        var genArr = '';
        if(info.gender == GUY) { len = 'guys_count'; genArr = 'guys';}
        else { len = 'girls_count'; genArr = 'girls';}

        delete roomList[socket.id][genArr][info.id];
        roomList[socket.id][len]--;

        delete roomList[socket.id];
        cb(null, null);
      } //////////////////////////////////////////////////////////////////////////////////////
    ], function(err, res) {
      if (err) { console.log(err.message); }

      socket.disconnect(); // отключаемся
    }); ///////////////////////////////////////////////////////////////////////////////////////
  });
} // Выходим из чата

//////////////////////// КОМНАТЫ ////////////////////////////////////////////////////////////////////////
// Предложить варианты смены комнаны: случайный стол, показать доступные, присоединитья к друзьям
function chooseRoom(socket) {
  socket.on('choose_room', function() {
    async.waterfall([
      function(cb) {
        var info = userList[socket.id].getInfo();

        var freeRooms = [];
        var genArr = '';
        if(info.gender == GUY) { genArr = 'guys';}
        else { genArr = 'girls'}

        for(item in roomList) {
          if(roomList.hasOwnProperty(item) && item[genArr].length < ONE_GENDER_IN_ROOM) {
            freeRooms.push(item);
          }
        }

        var index = randomInteger(0, freeRooms.length-1);
        var randRoom = freeRooms[index];

        cb(null, info, randRoom, genArr);
      },
      function(info, randRoom, getArr, cb) {
        var friendList = [];
        var allFriends = userList[socket.id].getFriends();
        var onlineFriends = [];
        for(var i = 0; i < allFriends.length; i++) {
          if(profiles[allFriends[i].id]) onlineFriends.push(profiles[allFriends[i]]);
        }

        for(var i = 0; i < onlineFriends.length; i++) {
          var room = roomList[onlineFriends[i].socket];
          if(room[getArr].length < ONE_GENDER_IN_ROOM) {
            friendList.push({ name: f_info.name, age: f_info.age, avatar: f_info.avatar});
          }
        }

        var res = {
          random    : randRoom,
          friends   : friendList
        };

        cb(null, res);
        }
    ], function(err, res) {
        if(err) {
          console.log(err.message);
          return socket.emit('error', err);
        }

        socket.emit('choose_room', res);
    })
  });
}

// Отправить список комнат
function showRooms(socket) {
  socket.on('show_rooms', function() {
    if (!checkAutho(socket.id)) {
      socket.emit('error', new Error("Ошибка при получении списка комнат: Такого пользователя нет на сайте"));
      return;
    }

    var info = userList[socket.id].getInfo();

    var len = '';
    var genArr = '';
    if (info.gender == GUY) {
      len = 'guys_count';
      genArr = 'guys';
    }
    else {
      len = 'girls_count';
      genArr = 'girls';
    }

    var freeRooms = [];
    for (item in roomList) {
      if (item[len] < ONE_GENDER_IN_ROOM) freeRooms.push(item);
    }

    var resRooms = [];
    for (var i = 0; i < freeRooms.length; i++) {
      var res = {name: freeRooms[i].name, guys: [], girls: []};
      var res = {name: freeRooms[i].name, guys: [], girls: []};

      for (guy in freeRooms.guys) {
        var g_info = guy.getInfo();
        res.guys.push({avatar: g_info.avatar});
      }
      for (girl in freeRooms.girls) {
        var g_info = girl.getInfo();
        res.girls.push({avatar: g_info.avatar});
      }
      resRooms.push(res);
    }

    socket.emit('show_rooms', resRooms);
  });
}
// Сменить комноту
function changeRoom(socket) {
  socket.on('change_room', function(roomName) {
    if (!checkAutho(socket.id)) {
      socket.emit('error', new Error("Ошибка при смене комнаты: Такого пользователя нет на сайте"));
      return;
    }

    var newRoom = null;
    var currRoom = roomList[socket.id];
    var profile = userList[socket.id];
    var info = profile.getInfo();
    var len = '';
    var genArr = '';
    if (info.gender == GUY) {
      len = 'guys_count';
      genArr = 'guys';
    }
    else {
      len = 'girls_count';
      genArr = 'girls';
    }

    if (roomName == "newRoom") {
      countRoom++;
      newRoom = {
        name: "Room" + countRoom, // Как-нибудь генерируем новое имя (????)
        guys: {},
        guys_count: 0,
        girls: {},
        girls_count: {},
        messages: []
      };
    } else {
      for (var item in roomList) {
        if (item.name == roomName) {
          newRoom = item;

          showLastMessages(socket, item);
        }
      }
    }
    socket.leave(currRoom.name);
    socket.join(newRoom.name);

    newRoom[genArr][info.id] = profile;
    newRoom[len]++;

    roomList[socket.id] = newRoom;

    delete currRoom[genArr][info.id];
    currRoom[len]--;

    info.guys = [];

    for(var i = 0; i < newRoom.guys; i++) {
      info.guys.push( {
        id     : newRoom.guys[i].id,
        avatar : newRoom.guys[i].avatar,
        vid    : newRoom.guys[i].vid,
        name   : newRoom.guys[i].name,
        age    : newRoom.guys[i].age
      });
    }

    info.girls = [];
    for(var i = 0; i < newRoom.girls; i++) {
      info.girls.push( {
        id     : newRoom.girls[i].id,
        avatar : newRoom.girls[i].avatar,
        vid    : newRoom.girls[i].vid,
        name   : newRoom.girls[i].name,
        age    : newRoom.girls[i].age
      });
    }

    socket.emit('open_room', info);
  });
}
///////////////////////  ПРОФИЛЬ ////////////////////////////////////////////////////////////////////////
// Получение профиля для редактирования (своего) или просмотра (чужого)
function showProfile(socket) {
  socket.on('show_profile', function(id) {
    if (!checkAutho(socket.id)) {
      return socket.emit('error',
          new Error("Ошибка при получении профиля: Такого пользователя нет на сайте"));
    }

    var profile = profiles[id];
    var info = profile.getInfo();

    var res = {
      name     : info.name,
      age      : info.age,
      location : info.location,
      gender   : info.gender,
      status   : info.status
    };

    socket.emit('show_profile', res);
  }); // socket.emit
}

function showPrivateMessages(socket) {
  socket.on('show_private_messages', function(){
    if (!checkAutho(socket.id)) {
      return socket.emit('error',
          new Error("Ошибка при получении личных сообщений: Такого пользователя нет на сайте"));
    }

    var messages = userList[socket.id].getHistory();
    socket.emit('show_private_messages', messages);
  });
}

function showGifts(socket) {
  socket.on('show_gifts', function(){
    if (!checkAutho(socket.id)) {
      return socket.emit('error',
          new Error("Ошибка при получении истории подарков: Такого пользователя нет на сайте"));
    }

    var gifts = userList[socket.id].getGifts();
    socket.emit('show_gifts', gifts);
  });
}

function showFriends(socket) {
  socket.on('show_friends', function(){
    if (!checkAutho(socket.id)) {
      return socket.emit('error',
          new Error("Ошибка при получении друзей: Такого пользователя нет на сайте"));
    }

    var friends = userList[socket.id].getFriends();
    socket.emit('show_friends', friends);
  });
}

function showGuests(socket) {
  socket.on('show_guests', function(){
    if (!checkAutho(socket.id)) {
      return socket.emit('error',
          new Error("Ошибка при получении гостей: Такого пользователя нет на сайте"));
    }

    var guests = userList[socket.id].getGuests();
    socket.emit('show_guests', gifts);
  });
}
/////////////////////////// ПОДАРКИ ////////////////////////////////////////////////////////////////////////
// Подарок пользователю, добавляем его в профиль и сообщаем тому, кому подарили
function makeGift(socket) {
  socket.on('makeGift', function(giftId, recId, message) {
    if (!checkAutho(socket.id)) {
      return socket.emit('error',
          new Error("Ошибка при добавлении подарка: Такого пользователя нет на сайте"));
    }
    var date = new Date();
    waterfall([
      function(cb) { // Ищим подарок с таким id в базе данных (?????)
         gifts.getGiftList(function(err, giftList) {
           if(err) { return cb(err, null) }
           for(var i = 0; i < giftList.length; i++) {
             if(giftId == giftList[i].id) {
               return cb(null, giftList[i]);
             }
           }
           cb(new Error("Нет такого подарка"), null);
         });
      },///////////////////////////////////////////////////////////////
      function(gift, cb) { // Добавляем подарок получателю
        profiles[recId].addGift(gift, function(err, result) {
          if (err) { return cb(err, null); }
          cb(null, gift);
        });
      },///////////////////////////////////////////////////////////////////
      function(gift, cb) { // Проверяем, авторизирован ли тот, кому дарим и получаем данные подарившего
        if (profiles[recId]) {
          var info = userList[socket.id].getInfo();
          var recipInfo = profiles[recId].getInfo();


          var savingMessage = { // Для получателя
            username: recipInfo.name,
            date: date,
            companion: info.id,
            companionname: info.name,
            incoming: true,
            text: message,
            gift: gift.id
          };

          cb(null, gift, savingMessage, info, recipInfo);
        }
        else{}
      }, ///////////////////////////////////////////////////////////////////////////////
      function (gift, savingMessage, info, recipInfo, cb) { // Сохраняем сообщение в историю получателя
        profiles[recId].addMessage(savingMessage, function(err, result) {
          if (err) { return cb(err, null); }

          savingMessage = { // Для отправителя
            username  : info.name,
            date      : date,
            companion : recipInfo.id,
            companionname : recipInfo.name,
            incoming  : false,
            text      : message,
            gift      : gift.data
          };

          cb(null, gift, savingMessage, info);
        });
      }, //////////////////////////////////////////////////////////////////////////////////////
      function(gift, savingMessage, info, cb) { // Сохраняем сообщение в историю отправителя
        userList[socket.id].addMessage(savingMessage, function(err, res) {
          if (err) { cb(err, null); }

          cb(null, gift, info);
        });
      }, ////////////////////////////////////////////////////////////////////////////////////
        function(gift, info, cb) { // Сообщаем о подарке
          info['message'] = message;
          info['gift'] = gift;
         // var socketId = ///////////////////////////////////////
          profiles[recId].getSocket(function(err, socketId) {
            if(err) { return cb(err, null); }

            cb(null, info, socketId);
          });
        },////////////////////////////////////////////////////////////////////////////////////
        function(info, socketId, cb) {
          var recipSocket = io.sockets.sockets[socketId];
          sendOne(recipSocket, info, function(err){
            if(err) {return cb(err, null); }

            cb(null, info);
          });
        },////////////////////////////////////////////////////////////////////////////////////
        function(info, cb) {
          sendOne(socket, info, function(err) {
            if(err) { return cb(err, null); }

            cb(null, null);
          });
        }////////////////////////////////////////////////////////////////////////////////////
    ], function(err) { // Вызывается последней. Обрабатываем ошибки
      if (err) {
        console.log(err.id + " : " + "Ошибка при при попытке сделать подарок: " + err.message);
        var errInfo = { id : err.id, message : "Ошибка при при попытке сделать подарок: " + err.message };
        socket.emit('error', errInfo);
      }
    }); // waterfall
  }); // socket.on
}

// Показать топ пользователей
function showTop(socket) {
  socket.on('showTop', function() {
    db.findAllUsers(function(err, users) {
      users.sort(comparePoints);

      views.renderView('showTop', users, function(err, content) {
        if (err) {
          console.log(err.id + ' ' + err.message);
          var errInfo = {id : err.id, message : err.message };
          socket.emit('error', errInfo);
        }

        socket.emit('showTop', content);
      });
    });
  });
}

function addToFriends(socket) {
  socket.on('addToFriends', function(uid) {
    userList[socket.id].addToFriends(uid, function(err, info) {
      if (err) {
        console.log(err.id + " : " + "Ошибка при при попытке добавить в друзья: " + err.message);
        var errInfo = { id : err.id, message : "Ошибка при при попытке добавить в друзья: " + err.message };
        return socket.emit('error', errInfo);
      }

      adminInfo.message = info.name + " добавлен в друзья";
      sendOne(socket, adminInfo, function(err, res) {
        if (err) {
          console.log(err.id + " : " + "Ошибка при при попытке добавить в друзья: " + err.message);
          var errInfo = { id : err.id, message : "Ошибка при при попытке добавить в друзья: " + err.message };
          socket.emit('error', errInfo);
        }
      });
    })
  });
}

/////////////////////////// СЛУЖЕБНЫЕ ФУНКЦИИ ///////////////////////////////////////////////////////////////
// Отправить сообщение всем в комнате
function sendInRoom(socket, room, message) {
  socket.broadcast.to(room.name).emit('message', message);
  socket.emit('message', message);

  room.messages.push(message);

  if (room.messages.length >= LEN_ROOM_HISTORY) {
    room.messages.shift();
  }
}

// Отправить сообщение одному
function sendOne(socket, message) {
    socket.emit('message', message);
}

// Показать последние сообщения
function showLastMessages(socket, room) {
  var messages = room.messages;
  if(!messages[0]) return callback(null, null);

  for(var i = 0; i < messages.length; i++) {
    sendOne(socket, messages[i]);
  }
}

function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function checkAutho(id) {
  var prof = userList[id];
  if (!prof) { console.log("Попытка неавторизованного доступа");
    return false;
  }
  return true;
}

function comparePoints(userA, userB) {
  return userB.points - userA.points;
}

function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}