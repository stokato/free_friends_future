var socketio  =  require('socket.io'),
    async     =  require('async'),
    validator =  require('validator');
                                                    // Свои модули
var profilejs =  require('./bin/profile'),          // Профиль
    dbjs = require('./bin/db.js');                  // База

var ONE_GENDER_IN_ROOM = 5;                         // Макс. количество игроков одного пола в комнате
var GUY = "guy";                                    // Идентификация пола
var GIRL = "girl";
var LEN_ROOM_HISTORY = 5;                           // Длина истории сообщений в комнате. Какая нужна ???

var io = null;                                      // Сокет
var db = new dbjs();                                // Менеджер БД - здесь нужен только при получении Топа и Магазина

var userList = {};                                  // Профили пользователей по сокетам
var roomList = {};                                  // Комнаты по сокетам
var rooms    = {};
var profiles = {};                                  // Профили пользователей по id (надо бы убрать)

var countRoom = 0;                                  // Счетчки комнат (сейчас нужен для генерации идентификатора окна)

/*
При подключении выполняем инициализацию и вешаем эмиттеры
 */
exports.listen = function(server, callback) {
  io = socketio.listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket, options) {
    initProfile(socket, options);

    sendPublicMessage(socket);

    exitChat(socket);

    chooseRoom(socket);
    showRooms(socket);
    changeRoom(socket);

    showProfile(socket);

    showPrivateMessages(socket);
    showGifts(socket);
    showFriends(socket);
    showGuests(socket);

    //showTop(socket);

    showGiftShop(socket);

    sendPrivateMessage(socket);
    makeGift(socket);
    addToFriends(socket);
    changeStatus(socket);
  });

  callback();
};
////////////////////// ИНИЦИАЛИЗАЦИЯ, ЧАТ, ОТКЛЮЧЕНИЕ//////////////////////////////////////////////////
/*
Выполняем инициализацию
- Создаем профиль
- Добавляем его в массив онлайн профилей
- Помещаем в комнату
- Получаем данные профиля (какие именно в этот момент нужны???)
- Получаем данные профилей игроков в комнате (для игрового стола)
- Отправляем все клиенту
 */
function initProfile(socket) {
  socket.on('init', function(options) {
    if(!checkInput('init', socket, options))
      return new GameError(socket, "INIT", "Верификация не пройдена");

    async.waterfall([ // Инициализируем профиль пользователя
      function (cb) {
        var profile = new profilejs();
        profile.init(socket, options, function (err, info) {
          if (err) { return cb(err, null); }

          userList[socket.id] = profile;
          profiles[info.id] = profile;

          cb(null, info);
        });
      }, ///////////////////////////////////////////////////////////////
      function (info, cb) { // Помещяем в комнату
        autoPlaceInRoom(socket, function (err, room) {
          if (err) { return cb(err, null); }

          cb(null, info, room);
        });
      },///////////////////////////////////////////////////////////////
      function (info, room, cb) { // Получаем данные по игрокам в комнате (для стола)
        getRoomInfo(room, function(err, roomInfo) {
          if (err) { return cb(err, null); }
          info['room'] = roomInfo;

          cb(null, info, room);
        });
      }///////////////////////////////////////////////////////////////
    ], function (err, info, room) { // Обрабатываем ошибки, либо передаем данные клиенту
      if (err) { return new GameError(socket, "INIT", err.message); }
      socket.emit('init', info);
      socket.broadcast.to().emit('online', { id: info.id, vid: info.vid } );
      showLastMessages(socket, room);
    });
  });
}
/*
Подготовить данные по комнате
- По каждому игроку в комнате
-- Берем данные его прифиля и добавлям в объект
- Возвращаем объект и комнату обратно
 */
function getRoomInfo(room, callback) {
  var info = { name : room.name, guys : [], girls : [] };

  var gInfo = null;
  for (guy in room.guys) {
    if (room.guys.hasOwnProperty(guy)){
      gInfo = {
        id: room.guys[guy].getID(),
        vid: room.guys[guy].getVID(),
        points: room.guys[guy].getPoints()
      };
      info.guys.push(gInfo);
    }
  }

  for (girl in room.girls) {
    if (room.girls.hasOwnProperty(girl)) {
      gInfo = {
        id: room.girls[girl].getID(),
        vid: room.girls[girl].getVID(),
        points: room.girls[girl].getPoints()
      };
      gInfo['points'] = room.girls[girl].getPoints();
      info.girls.push(gInfo);
    }
  }
  callback(null, info, room);
}

/*
Помещаем пользователя в случайную комнату (при подключении)
- Получаем свой профиль
- Узнаем пол
- Ищем комнату где не хватает наименьшее число игроков нашего пола
- Если нет свободных комнат, созадем новую
- Отвязываемся от старой комнаты (наверное лишнее)
- Привязываемся к новой
- Возвращаем выбранную комнату
 */
function autoPlaceInRoom(socket, callback) {
  var profile = userList[socket.id];
  var room = null;
  var count = ONE_GENDER_IN_ROOM +1;
  var len = '';
  var genArr = '';
  if(profile.getGender() == GUY) { len = 'guys_count'; genArr = 'guys';}
  else { len = 'girls_count'; genArr = 'girls';}

  for(item in roomList) {
    if(item != socket.id) {
      var need = ONE_GENDER_IN_ROOM - roomList[item][len];
      if(need > 0 && need < count) {
        count = need;
        room = roomList[item];
      }
    }
  }


  if(!room) { // Нет ни одной свободной комнаты
    room = {
      name: "Room" + (++countRoom) , // Как-нибудь генерируем новое имя (????)
      guys: {},
      guys_count: 0,
      girls: {},
      girls_count: 0,
      messages: []
    };
    rooms[room.name] = room;
  }

  socket.join(room.name);

  room[genArr][profile.getID()] = profile;
  room[len] ++;

  var oldRoom = roomList[socket.id];
  if(oldRoom) {
    socket.leave(oldRoom.name);
    delete oldRoom[genArr][profile.getID()];
    oldRoom[len]--;
    if(oldRoom.guys_count == 0 && oldRoom.girls_count == 0) delete rooms[oldRoom.name];
  }

  roomList[socket.id] = room;

  callback(null, room);
}

/*
Отправляем сообщение в комнату
- Получаем свой профиль и комнату
- Отправляем сообщение всем в комнате (и себе)
 */
function sendPublicMessage(socket) {
  socket.on('message', function(message){
    if(!checkInput('message', socket, message))
      return new GameError(socket, "SENDPUBMESSAGE", "Верификация не пройдена");

    var profile = userList[socket.id];
    var info = {
      id: profile.getID(),
      vid: profile.getVID(),
      text: message.text,
      date: message.date
    };
    var currRoom = roomList[socket.id];

    sendInRoom(socket, currRoom, info);
  });
}
// Отправка приватных сообщений, они сохраняются в истории собеседников и не приходят другим в комнате

/*
Выходим (отключаемся)
- получаем свой профиль и комнату
- сообщаем все в комнате об уходе
- сохраняем профиль в БД
- удаляем профиль и комнату из памяти
- отключаем сокет
 */
function exitChat(socket) {
  socket.on('exit', function() {
    if(!checkInput('exit', socket, null))
      return new GameError(socket, "EXIT", "Верификация не пройдена");

    var profile = userList[socket.id];
    async.waterfall([
      ///////////////////////////////////////////////////////////////////////////////////
      function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
        var info ={ id : profile.getID(), vid : profile.getVID() };

        socket.broadcast.to().emit('offline', info);

        cb(null, null);
      }, ///////////////////////////////////////////////////////////////////////////////////////
      function (res, cb) { // сохраняем профиль в базу
        profile.save(function(err, res) {
          if (err) { return cb(err, null); }

          cb(null, null);
        });
      }, /////////////////////////////////////////////////////////////////////////////////////
      function (res, cb) { // удалеяем профиль и сокет из памяти
        delete userList[socket.id];

        var len = '';
        var genArr = '';
        if(profile.getGender() == GUY) { len = 'guys_count'; genArr = 'guys';}
        else { len = 'girls_count'; genArr = 'girls';}

        delete roomList[socket.id][genArr][profile.getID()];
        roomList[socket.id][len]--;
        delete roomList[socket.id];

        cb(null, null);
      } //////////////////////////////////////////////////////////////////////////////////////
    ], function(err, res) {
      if (err) { new GameError(null, "EXIT", err.message) }

      socket.disconnect(); // отключаемся
    }); ///////////////////////////////////////////////////////////////////////////////////////
  });
} // Выходим из чата

//////////////////////// КОМНАТЫ ////////////////////////////////////////////////////////////////////////
/*
Предлагаем способ смены комнаты
- Получаем профиль
- Узнаем пол
- Получаем комнаты, в которых есть место для нашего пола
- Выбираем из них рендомом одну
- Получаем всех наших друзей (из БД)
- Если друг онлайн и в его комнате есть место для нашего пола - добавляем в выходной список
- Отправляем клиенту случайную комнату и список друзей (какие данные нужны ???)
 */
function chooseRoom(socket) {
  socket.on('choose_room', function() {
    if(!checkInput('choose_room', socket, null))
      return new GameError(socket, "CHOOSEROOM", "Верификация не пройдена");

    async.waterfall([////////////////// Отбираем комнаты, в которых не хватает игроков
      function(cb) {
        var profile = userList[socket.id];

        var freeRooms = [];
        var len = '';
        var genArr = '';
        if(profile.getGender() == GUY) { genArr = 'guys'; len = 'guys_count'}
        else { genArr = 'girls'; len = 'girls_count'}

        for(item in rooms) {
          if(rooms.hasOwnProperty(item) && rooms[item][len] < ONE_GENDER_IN_ROOM) {
            freeRooms.push(rooms[item]);
          }
        }

        var index = randomInteger(0, freeRooms.length-1);
        var randRoom = freeRooms[index];
        getRoomInfo(randRoom, function(err, info) {
          if (err) { return cb(err, null); }

          cb(null, profile, info, genArr, len);
        });
      },////////////////////////////////// Получаем всех друзей пользователя
      function(profile, roomInfo, genArr, len, cb) {
        profile.getFriends(function(err, allFriends) {
          if(err) { return cb(err, null); }

          cb(null, roomInfo,  len, allFriends);
        });
      },///////////////////////// Составляем список друзей с неполными коматами
      function( roomInfo, len, allFriends, cb) {
        var friendList = [];
        allFriends = allFriends || [];
        for(var i = 0; i < allFriends.length; i++) {
          var currFriend = profiles[allFriends[i].id];
          if(currFriend) {
            var frSocket = currFriend.getSocket();
            var friendsRoom = roomList[frSocket.id];
            if(friendsRoom[len] < ONE_GENDER_IN_ROOM) {
              var currInfo = {
                id : currFriend.getID(),
                vid : currFriend.getVID(),
                room : friendsRoom.name
              };
              friendList.push(currInfo);
            }
          }
        }
        var res = {
          random    : roomInfo,
          friends   : friendList
        };

        cb(null, res);
      }////////////////////////////////// Обрабатываем ошибки или отравляем результат
    ], function(err, res) {
        if(err) { return new GameError(socket, "CHOOSEROOM", err.message); }

        socket.emit('choose_room', res);
    })
  });
}

/*
Показать список комнат (столов)
- Получаем данные профиля
- Узанем пол
- Выбираем все комнаты со свободными местами для нашего пола и для каждой
-- Получаем ее идентификтор и инфу по парням и девушкам (какую ???)
- Передаем клиенту
 */
function showRooms(socket) {
  socket.on('show_rooms', function() {
    if(!checkInput('show_rooms', socket, null))
      return new GameError(socket, "SHOWROOMS", "Верификация не пройдена");

    var len = '';
    if (userList[socket.id].getGender() == GUY) {
      len = 'guys_count';
    }
    else {
      len = 'girls_count';
    }

    var resRooms = [];
    async.map(rooms, function(item, cb) {
      if (item[len] < ONE_GENDER_IN_ROOM) {
        getRoomInfo(item, function(err, info) {
          if(err) { return cb(err, null); }

          resRooms.push(info);
          cb(null, null);
        });
      }
    }, function(err, results){
      if(err) { return new GameError(socket, 'SHOWROOMS', err.message)}

      socket.emit('show_rooms', resRooms);
    });
  });
}

/*
Сменить комнату: Идентификатор новой комнаты
 - Получаем свой профиль
 - Узнаем пол
 - Если создаем комнату (клиент может создавать комнаты ?)
 -- Созадем новый объект комнаты и геним ему идентификатор
 - Если выбираем из имеющихся
 -- Отправляем клиенту последние сообщения комнаты (сколько ???)
 - Отвязываеся от старой комнаты
 - Связываемся с новой
 - Получаем данные профиля (какие ???)
 - Добавляем к ним данные игроков (девушки и парни на игровом столе)
 - Отправляем клиенту
 */
function changeRoom(socket) {
  socket.on('change_room', function(options) {
    if(!checkInput('change_room', socket, options))
      return new GameError(socket, "CHANGEROOM", "Верификация не пройдена");

    var newRoom = null;
    var currRoom = roomList[socket.id];
    var profile = userList[socket.id];
    var len = '';
    var genArr = '';
    if (profile.getGender() == GUY) {
      len = 'guys_count';
      genArr = 'guys';
    }
    else {
      len = 'girls_count';
      genArr = 'girls';
    }

    if (options.room == "new_room") {
      countRoom++;
      newRoom = {
        name: "Room" + (countRoom), // Как-нибудь генерируем новое имя (????)
        guys: {},
        guys_count: 0,
        girls: {},
        girls_count: 0,
        messages: []
      };
      rooms[newRoom.name] = newRoom;
    } else {
      for (var item in roomList) {
        if (roomList[item].name == roomName) {
          newRoom = roomList[item];

          showLastMessages(socket, roomList[item]);
        }
      }
    }
    if(!newRoom) { return new GameError(socket, "CHANGEROOM", "Попытка открыть несуществующую комнату")}

    socket.leave(currRoom.name);
    socket.join(newRoom.name);

    newRoom[genArr][profile.getID()] = profile;
    newRoom[len]++;

    roomList[socket.id] = newRoom;

    delete currRoom[genArr][profile.getID()];
    currRoom[len]--;
    if(currRoom.guys_count == 0 && currRoom.girls_count == 0) delete rooms[currRoom.name];


    getRoomInfo(newRoom, function(err, info) {
      if(err) { return new GameError(socket, "CHANGEROOM", err.message); }

      socket.emit('open_room', info);
    });
  });
}

///////////////////////  ПРОФИЛЬ ////////////////////////////////////////////////////////////////////////
/*
Получаем профиль (Нужна ли вообще такая функция, если в окне профиля только инф,
    которую можно достать из соц. сетей ????)
   - Если смотрим свой профиль - отправляем клиенту наши данные (какие ?)
   - Если чужой
   -- Получам профиль того, кого смотрим (из ОЗУ или БД)
   -- Добавляем себя ему в гости (пишем сразу в БД)
   -- Отправлем клиенту данные профиля (????)
   -- Если тот, кого смотрим, онлайн, наверно нужно его сразу уведомить о гостях ???
 */
function showProfile(socket) {
  socket.on('show_profile', function(options) {
    if(!checkInput('show_profile', socket, options))
      return new GameError(socket, "ADDFRIEND", "Верификация не пройдена");

    var selfProfile = userList[socket.id];

    if (selfProfile.getID() == options.id) { // Если открываем свой профиль
      var info = {
        id : selfProfile.getID(),
        vid : selfProfile.getVID(),
        status: selfProfile.getStatus(),
        points: selfProfile.getPoints(),
        money: selfProfile.getMoney()
      };

      return socket.emit('show_profile', info);
    }

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль того, чей просматриваем
        var friendProfile = null;
        var friendInfo = null;
        if (profiles[options.id]) { // Если онлайн
          friendProfile = profiles[options.id];
          friendInfo  = {
            id : friendProfile.getID(),
            vid : friendProfile.getVID(),
            status: friendProfile.getStatus(),
            points: friendProfile.getPoints()
          };
          cb(null, friendProfile, friendInfo);
        }
        else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {
            if (err) {return cb(err, null); }

            friendInfo = {
              id : info.id,
              vid : info.vid,
              status: info.status,
              points: info.points
            };
            cb(null, friendProfile, friendInfo);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (friendProfile, friendInfo, cb) { // Добавляем себя в гости
        var info = {
          id : selfProfile.getID(),
          vid : selfProfile.getVID(),
          points : selfProfile.getPoints(),
          date : options.date
        };
        friendProfile.addToGuests(info, function(err, res) {
          if(err) { return cb(err, null); }

          cb(null, friendInfo, info);
        });//////////////////////////////////////////////////////////////
      }], function (err, friendInfo, info) { // Вызывается последней. Обрабатываем ошибки
      if(err) { return new GameError(socket, "ADDFRIEND", err.message); }

      socket.emit('show_profile', friendInfo); // Отправляем инфу

      if(profiles[friendInfo.id]) { // Если тот, кого просматирваем, онлайн, сообщаем о посещении
        var friendSocket = profiles[friendInfo.id].getSocket();
        friendSocket.emit('add_guest', info);
      }
    }); // waterfall
  }); // socket.emit
}

/*
Показать свои личные сообщения
 - Получаем историю сообщений - массив сообщений (дата, ИД собеседника, вх/исх, текст) (из БД)
 - Отправляем клиенту
 */
function showPrivateMessages(socket) {
  socket.on('show_private_messages', function(){
    if(!checkInput('show_private_messages', socket, null))
      return new GameError(socket, "SHOWHISTORY", "Верификация не пройдена");

    userList[socket.id].getHistory(null, null, function(err, messages){
        if(err) { return new GameError(socket, "SHOWHISTORY", err.message); }

        socket.emit('show_private_messages', messages);
    });
  });
}

/*
Показать подарки
 - Получаем подарки - массив подарков (ИД, тип, дата, src ??) (из БД)
 - Отправляем клиенту
 */
function showGifts(socket) {
  socket.on('show_gifts', function(){
    if(!checkInput('show_gifts', socket, null))
      return new GameError(socket, "SHOWGIFTS", "Верификация не пройдена");

    userList[socket.id].getGifts(function(err, gifts) {
        if(err) { return new GameError(socket, "SHOWGIFTS", err.message); }

        socket.emit('show_gifts', gifts);
    });
  });
}

/*
Показать своих друзей
 - Получаем друзей - массив (ИД и дата начала дружбы) (из БД)
 - Передаем клиенту
 */
function showFriends(socket) {
  socket.on('show_friends', function(){
    if(!checkInput('show_friends', socket, null))
      return new GameError(socket, "SHOWFRIENDS", "Верификация не пройдена");

    userList[socket.id].getFriends(function(err, friends) {
        if(err) { return new GameError(socket, "SHOWFRIENDS", err.message); }

        socket.emit('show_friends', friends);
    });
  });
}

/*
 Показать свои подарки (полученные)
  - Получаем подарки - массив подарков со всеми свойствами (из БД)
  - Передаем клиенту
 */
function showGuests(socket) {
  socket.on('show_guests', function(){
    if(!checkInput('show_guests', socket, null))
      return new GameError(socket, "SHOWGUESTS", "Верификация не пройдена");

    userList[socket.id].getGuests(function(err, guests) {
        if(err) { return new GameError(socket, "SHOWGUESTS", err.message); }

        socket.emit('show_guests', guests);
    });
  });
}

/*
 Отправить личное сообщение: Сообщение, объект с инф. о получателе (VID, еще что то?)
 - Получаем свой профиль
 - Получаем профиль адресата (из ОЗУ или БД)
 - Сохраняем адресату сообщение
 - Сохраняем сообщение себе                                       ???
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
function sendPrivateMessage(socket) {
  socket.on('private_message', function(options) {
    if(!checkInput('private_message', socket, options))
      return new GameError(socket, "SENDPRIVMESSAGE", "Верификация не пройдена");

    var selfProfile = userList[socket.id];
    async.waterfall([//////////////////////////////////////////////////////////////
      function(cb) { // Получаем данные адресата и готовим сообщение к добавлению в историю
        var friendProfile = null;
        if (profiles[options.id]) { // Если онлайн
          friendProfile = profiles[options.id];
          cb(null, friendProfile);
        }
        else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) {return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      }, ///////////////////////////////////////////////////////////////////////////////
      function (friendProfile, cb) { // Сохраняем сообщение в историю получателя
        var savingMessage = {
          date      : options.date,
          companionid : selfProfile.getID(),
          companionvid : selfProfile.getVID(),
          incoming  : true,
          text      : options.text
        };
        friendProfile.addMessage(savingMessage, function(err, result) {
          if (err) { return cb(err, null); }

          if(profiles[options.id]) {
            savingMessage['vid'] = selfProfile.getVID();
            var friendSocket = profiles[options.id].getSocket();
            friendSocket.emit('private_message', savingMessage);
          }
          cb(null, savingMessage, friendProfile);
        });
      }, //////////////////////////////////////////////////////////////////////////////////////
      function(savingMessage, friendProfile, cb) { // Сохраняем сообщение в историю отправителя
        savingMessage = {
          date      : options.date,
          companionid : friendProfile.getID(),
          companionvid : friendProfile.getVID(),
          incoming  : false,
          text      : options.text
        };
        selfProfile.addMessage(savingMessage, function(err, res) {
          if (err) { cb(err, null); }

          savingMessage['vid'] = friendProfile.getVID();
          socket.emit('private_message', savingMessage);
          cb(null, null);
        });
      }/////////////////////////////////////////////////////////////////////////////////
    ], function(err) { // Вызывается последней или в случае ошибки
      if(err) { new GameError(socket, "SENDPRIVMESSAGE", err.message); }
    });
  });
}

/*
 Отправить изменить статус игрока: Статус
 - Получаем свой профиль
 - Устанавливаем новый статус (пишем в БД)
 - Возвращаем клиенту новый статус
 */
function changeStatus(socket) {
  socket.on('change_status', function(options) {
    if(!checkInput('change_status', socket, options))
      return new GameError(socket, "CHANGESTATUS", "Верификация не пройдена");

    var profile = userList[socket.id];
    profile.setStatus(options.status, function(err, st) {
      if(err) { return new GameError(socket, "CHANGESTATUS", err.message); }

      socket.emit('change_status', { status: st });
    })
  });
}

/*
 Сделать подарок: ИД подарка, объект с инф. о получателе (VID, еще что то?)
 - Ищем подарок по ИД в базе
 - Получаем профиль адресата (из ОЗУ или БД)
 - Добавляем адресату подарок (пишем сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
function makeGift(socket) {
  socket.on('make_gift', function(options) {
    if(!checkInput('make_gift', socket, options))
      return new GameError(socket, "MAKEGIFT", "Верификация не пройдена");

    async.waterfall([///////////////////////////////////////////////////////////////////
      function(cb) { // Ищим подарок с таким id в базе данных (?????)
        db.findGood(options.giftid, function(err, gift) {
          if(err) { return cb(err, null) }

          if(gift) { cb(null, gift);
          } else cb(new Error("Нет такого подарка"), null);
        });
      },///////////////////////////////////////////////////////////////
      function(gift, cb) { // Ищим подарок с таким id в базе данных (?????)
        var money = userList[socket.id].getMoney();
        if(money < gift.price) {
          cb(new Error("Недостаточно монет для совершения подарка"), null);
        } else {
          userList[socket.id].setMoney(money - gift.price, function(err, money) {
            if (err) { return cb(err, null); }

            socket.emit('money', { money : money } );
            cb(null, gift);
          });
        }
      },///////////////////////////////////////////////////////////////
      function(gift,cb) { // Получаем профиль адресата
        var recProfile = null;

        if (profiles[options.id]) { // Если онлайн
          recProfile = profiles[options.id];
          cb(null, recProfile, gift);
        }
        else {                // Если нет - берем из базы
          recProfile = new profilejs();
          recProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, recProfile, gift);
          });
        }
      },///////////////////////////////////////////////////////////////
      function(recProfile,  gift, cb) { // Сохраняем подарок
        var selfProfile = userList[socket.id];
        gift.fromid = selfProfile.getID();
        gift.fromvid = selfProfile.getVID();
        gift.date = options.date;
        recProfile.addGift(gift, function (err, result) {
          if (err) { return cb(err, null); }

          cb(null, gift);
        });
      }
    ], function(err, gift) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return new GameError(socket, "MAKEGIFT", err.message); }

      if (profiles[options.id]) {
        var recSocket = profiles[options.id].getSocket();
        var info = {
          giftid : gift.id,
          type   : gift.type,
          data   : gift.data,
          date   : gift.date,
          fromid : gift.fromid,
          fromvid : gift.fromvid,
          title  : gift.title
        };
        recSocket.emit('make_gift', info);
      }
    }); // waterfall
  }); // socket.on
}

/*
Добавить пользователя в друзья: Информация о друге (VID, или что то еще?)
 - Получаем свой профиль
 - Получаем профиль друга (из ОЗУ или БД)
 - Добдавляем друг другу в друзья (Сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) ???
 */
function addToFriends(socket) {
  socket.on('add_friend', function(options) {
    if(!checkInput('add_friend', socket, options))
      return new GameError(socket, "ADDFRIEND", "Верификация не пройдена");

    var selfProfile = userList[socket.id];
    var selfInfo = {
      id:selfProfile.getID(),
      vid: selfProfile.getVID(),
      date: options.date
    };
    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль друга
        var friendProfile = null;
        if (profiles[options.id]) { // Если онлайн
          friendProfile = profiles[options.id];
          cb(null, friendProfile);
        }
        else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) {return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (friendProfile, cb) { // Добавляем первого в друзья
        friendProfile.addToFriends(selfInfo, function(err, res) {
          if(err) { return cb(err, null); }

          if(profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
            var friendSocket = friendProfile.getSocket();
            friendSocket.emit('add_friend', selfInfo);
          }

          cb(null, friendProfile);
        })
      },
      function (friendProfile, cb) { // Добавляем второго
        var friendInfo = {
          id :    friendProfile.getID(),
          vid:    friendProfile.getVID(),
          points: friendProfile.getPoints(),
          date:   options.date
        };
        selfProfile.addToFriends(friendInfo, function(err, res) {
          if(err) { return cb(err, null); }

          socket.emit('add_friend', friendInfo);

          cb(null, null);
        })
      }], function (err, res) { // Вызывается последней. Обрабатываем ошибки
      if(err) { return new GameError(socket, "ADDFRIEND", err.message); }
    }); // waterfall
  });
}
/////////////////////////// ПОДАРКИ ////////////////////////////////////////////////////////////////////////
/*
  Получить магазин с подарками
  - Получаем все возможные подарки из базы
  - Отправляем клиенту
 */
function showGiftShop(socket) {
 socket.on('show_gift_shop', function() {
   if(!checkInput('show_gift_shop', socket, null))
     return new GameError(socket, "SHOWGIFTSHOP", "Верификация не пройдена");

   db.findAllGoods(function(err, goods) {
     if(err) { return new GameError(socket, "SHOWGIFTSHOP", err.message); }

     socket.emit('show_gift_shop', goods);
   });
 });
}

/////////////////////////// ТОП ИГРОКОВ /////////////////////////////////////////////////////////////////
/*
 Показать топ пользователей
 - Получаем заданные поля из базы, (какие нужны ?)
 - Сортируем по очкам
 - Отправляем клиенту
 */
function showTop(socket) {
  socket.on('show_top', function() {
    if(!checkInput('show_top', socket, options))
      return new GameError(socket, "SHOWTOP", "Верификация не пройдена");

    var fList = ["name", "gender", "points"];
    db.findAllUsers(fList, function(err, users) {
      if(err) { return new GameError(socket, "SHOWTOP", err.message); }

      users.sort(comparePoints);

      socket.emit('show_top', users);
    });
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

  for(var i = 0; i < messages.length; i++) {
    sendOne(socket, messages[i]);
  }
}

// Для сортировки массива игроков (получение топа по очкам)
function comparePoints(userA, userB) {
  return userB.points - userA.points;
}

function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}

// Свой объект ошибок
function GameError(socket, func, message) {
  this.message = message;
  this.stack = (new Error()).stack;

  switch(func) {
    case "INIT"       : this.name = "Ошибка инициализации";
      break;
    case "EXIT"       : this.name = "Ошибка отключения от игры";
      break;
    case "CHOOSEROOM" : this.name = "Ошибка открытия окна смены стола";
      break;
    case "SHOWROOMS"  : this.name = "Ошибка открытия окна доступных столов";
      break;
    case "CHANGEROOM" : this.name = "Ошибка смены стола";
      break;
    case "SHOWPROFILE": this.name = "Ошибка открытия окна профиля";
      break;
    case "SHOWHISTORY": this.name = "Ошибка открытия окна личных сообщений";
      break;
    case "SHOWGIFTS"  : this.name = "Ошибка открытия окна подарков";
      break;
    case "MAKEGIFT"   : this.name = "Ошибка совершения подарка";
      break;
    case "SHOWTOP"    : this.name = "Ошибка открытия топа игроков";
      break;
    case "SENDPUBMESSAGE" : this.name = "Ошибка отправки публичного сообщения";
      break;
    case "SENDPRIVMESSAGE" : this.name = "Ошибка отправки личного сообщения";
      break;
    case "SHOWGIFTSHOP" : this.name = "Ошибка открытия окна магазина подарков";
      break;
    case "ADDFRIEND" : this.name = "Ошибка добавления в друзья";
      break;
    case "CHANGESTATUS" : this.name = "Ошибка изменения статуса";
      break;
    default:  this.name =   "Неизвестная ошибка"
  }
  console.log(this.name + " : " + this.message);
  console.log(this.stack);

  if(socket)
    socket.emit('error', this);
}
GameError.prototype = Object.create(Error.prototype);
GameError.prototype.constructor = GameError;

function checkInput(em, socket, options) {
  if(em == 'init' && userList[socket.id] ) { new Error("Пользователь уже инициализирован");  return false }
  if(em != 'init' && !userList[socket.id] ) { new Error("Пользователь не авторизован");  return false }

  var isValid = true;
  if(em == 'init') {
    isValid = (validator.isInt(options.age))? isValid : false;
    isValid = (!validator.isNull(options.location))? isValid : false;
    isValid = (options.gender == 'guy' || options.gender == 'girl')? isValid : false;
  }
  if(em == 'message') {
    isValid = (validator.isDate(options.date))? isValid : false;
  }

  if(em == 'change_room') {
    isValid = (rooms[options.room] || options.room == "new_room")? isValid : false;
    isValid = (roomList[socket.id].name != options.room)? isValid : false;
    console.log(options);
  }

  if(em == 'show_profile') {
    isValid = (validator.isAlphanumeric(options.id))? isValid : false;
    isValid = (validator.isDate(options.date))? isValid : false;
  }

  if(em == 'private_message') {
    isValid = (validator.isAlphanumeric(options.id))? isValid : false;
    isValid = (validator.isDate(options.date))? isValid : false;
    isValid = (userList[socket.id].getID() != options.id)? isValid : false;
  }

  if(em == 'make_gift') {
    isValid = (validator.isAlphanumeric(options.id))? isValid : false;
    isValid = (validator.isAlphanumeric(options.giftid))? isValid : false;
    isValid = (validator.isDate(options.date))? isValid : false;
    isValid = (userList[socket.id].getID() != options.id)? isValid : false;
  }

  if(em == 'add_friend') {
    isValid = (validator.isAlphanumeric(options.id))? isValid : false;
    isValid = (userList[socket.id].getID() != options.id)? isValid : false;
  }

  if(em == 'change_status') {

  }

  return isValid;
}