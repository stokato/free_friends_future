var socketio  =  require('socket.io'),
    waterfall =  require('async-waterfall'),
    async     =  require('async'),
    path      =  require('path');

var viewsjs   =  require(path.join(__dirname, '/bin/views')),
    profilejs =  require(path.join(__dirname, '/bin/profile')),
    gamejs    =  require(path.join(__dirname, '/bin/game')),
    giftsjs   =  require(path.join(__dirname, '/bin/gifts'));

var dbjs = require(path.join(__dirname, '/bin/db.js'));
var db = new dbjs();

var io;
var gifts = new giftsjs();
var views = new viewsjs();

var adminPro  = null;     // Профиль администратора
var adminInfo = null;     // Сведения об администраторе - для сообщений

var userList = [];        // Соответствия сокетов и ид профилей
var roomList = [];        // Соответствия сокетов и названий комнат
var profiles = [];        // Профили пользователей

var lenQueue = 5;
var countRoom = 2;
var rooms = {          // Список комнат
    room1 : {
      name: "Room1",
      countUsers: 0,
      messages: [],
      game: new gamejs()
    },
    room2 : {
      name: "Room2",
      countUsers: 0,
      messages: [],
      game: new gamejs()
    }
};


// Получаем профиль администратора и объект с данными для его сообщений
if (!adminInfo) {
  adminPro = new profilejs(); 
  adminPro.build("admin", function(err, user) {
  if (err) { console.log("Ошибка при получении профиля адинистратора: " + err.message); }
    console.log("Профиль администратора " + user.name + " создан");
    user.history = null;
    user.gifts = null;
    adminInfo = user;
  }); // build
}

// Инициализатор
exports.listen = function(server, callback) {
  io = socketio.listen(server);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {

    //sendPublicMessage(socket, userList, roomList, adminInfo);
    //sendPrivateMessage(socket, userList, profiles, adminInfo);
    //var defRoom = rooms.room1;
    //enterChat(socket, profilejs, userList, roomList, defRoom, profiles, adminInfo);
    //exitChat(socket);
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

    //socket.on('rooms', function() {
    //    socket.emit('rooms', io.sockets.manager.rooms);
    //}); //var usersInRoom = io.sockets.clients(room);
    
  });
  callback();
};
///////////////////// ОБМЕН СООБЩЕНИЯМИ ///////////////////////////////////////////////////////////////
// Отправка сообщения всем в комнате
function sendPublicMessage(socket, userList, roomList, adminInfo) {
  socket.on('message', function(message){
    waterfall([ //////////////////////////////////////////////////////////////////////////
        function(cb) { // Проверяем, авторизирован ли пользователь и отправляем сообщение
          var profile = userList[socket.id];
          if (profile) {
            userList[socket.id].getInfo(function(err, info){
              if (err) { return cb(err, null); }

              info['message'] = message;

              cb(null, info);
            });
          } else {
            cb(new Error("Вы не авторизированы и не можете обмениваться сообщениями"),null);
          }
        },////////////////////////////////////////////////////////////////////////////
        function(info, cb) {
          var currRoom = roomList[socket.id];
          sendInRoom(socket, currRoom, info, function(err) {
            if(err) { return cb(err, null) }

            cb(null, info);
          })
        },///////////////////////////////////////////////////////////////////////////
        function(info, cb) {
          sendOne(socket, info, function(err) {
            if(err) { return cb(err, null); }

            cb(null, null);
          })
        }
    ],///////////////////////////////////////////////////////////////////////////////
    function(err) {
      if(err) {
        console.log(err.id + " : " + err.message);
        var errInfo = { id: err.id, message: err.message };
        socket.emit('error', errInfo);
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
//////////////////////// ВХОД - ВЫХОД /////////////////////////////////////////////////////////////////
// Входим в чат
function enterChat(socket, profilejs, userList, roomList, defRoom, profiles, adminInfo) {
    socket.on('enter', function(uid) {
      waterfall([ //////////////////////////////////////////////////////////////
        function (cb) { // Проверяем, есть ли такой id уже в чате
          if (profiles[uid]) { return cb(new Error("Такой пользователь уже в чате")); }

          cb(null, null);
        },////////////////////////////////////////////////////////////////////////
        function (res, cb) { // Получаем профиль и сохраняем в памяти
          var profile = new profilejs();
          profile.build(uid, function(err, user) {
            if (err) {
              return cb(err);
            }
            userList[socket.id] = profile;
            profiles[user.id] = profile;

            profile.setSocket(socket.id, function(err, socketId) {
              if (err) {
                console.log("Не удалось установить ид сокета для текущего профиля");
              }

              cb(null, user);
            });
          }); // build
        },////////////////////////////////////////////////////////////////////////////
        function(user, cb) {
          socket.join(defRoom.name);
          defRoom.countUsers ++;

          roomList[socket.id] = defRoom;

          cb(null, user);
        }, /////////////////////////////////////////////////////////////////////////
        function(user, cb) {
          adminInfo['message'] = "Пользователь " + user.name + " присоединился к чату";
          sendAll(socket, adminInfo, function(err) {
            if(err) { return cb(err, null); }

            cb(null, user);
          });
        },//////////////////////////////////////////////////////////////////////////
        function(user, cb) {
          showLastMessages(socket, defRoom, function(err) {
            if(err) { return cb(err, null); };

            cb(null, user);
          });
        },//////////////////////////////////////////////////////////////////////////
        function(user, cb) {
          adminInfo['message'] = "Добро пожаловать " + user.name;
          sendOne(socket, adminInfo, function(err) {
            if(err) { return cb(err, null); }

            cb(null, null);
          });
        },//////////////////////////////////////////////////////////////////////////
        function(res, cb) {
          views.renderView('logout', null, function(err, content) {
            if (err) {return cb(err, null);}

            socket.emit('enter', content);
            cb(null, null);
          });
        }//////////////////////////////////////////////////////////////////////////
      ], function(err, res) { // Сообщаем о входе пользователя в чат
        if (err) {
              console.log(err.id + " : " + err.message);
              var errInfo = { id: err.id, message: err.message };
              socket.emit('error', errInfo);
        }
      });
    }); // onenter
} // Входим в чат

// Выходим из чата
function exitChat(socket) {
  socket.on('exit', function() {
    if(!checkAutho(socket.id)) {
      var errInfo = {id : 0, message : "Вы не авторизированы" };
      socket.emit('error', errInfo);
      return;
    }

    var profile = userList[socket.id];
    var game = roomList[socket.id].game;
    var room = roomList[socket.id];
    waterfall([
      ///////////////////////////////////////////////////////////////////////////////////
      function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
        profile.getInfo(function(err, info) {
          if (err) { return cb(err, null); }
          adminInfo['message'] = "Пользователь " + info.name + " вышел из чата";

          cb(null, info);
        });
      }, ///////////////////////////////////////////////////////////////////////////////////
      function(info, cb) {
        sendAll(socket, adminInfo, function(err) {
          if(err) { return cb(err, null); }

          cb(null, info);
        });
      },///////////////////////////////////////////////////////////////////////////////////
      function(info, cb) { // Если пользователь в игре, удаляем его оттуда
        if(!game) { return cb(null, info); }

        game.deleteGamer(socket.id, function(err, gamer, gameName, result) {
          if (err) { return cb(err, null); }
          if (!gamer) { return cb(null, info) }
          //socket.emit('game', true, gameName, null, info);
          //socket.broadcast.to(room.name).emit('game', false, gameName, null, info);
          //emitGameOne(socket, true, gameName, null, null, function(err) {
          //  if(err) { return cb(err, null); }

            emitGameInRoom(socket, room.name, true, gameName, result, null, function(err){
              if(err) { return cb(err, null); }

              cb(null, info);
            });
         // });
        });
      }, ///////////////////////////////////////////////////////////////////////////////////////
      function (info, cb) { // сохраняем профиль в базу
        profile.save(function(err, res) {
          if (err) { return cb(err, null); }
          cb(null, info);
        });
      }, /////////////////////////////////////////////////////////////////////////////////////
      function (info, cb) { // удалеяем профиль и сокет из памяти
        //delete profiles[userList[socket.id]];
        delete profiles[info.id];
        delete userList[socket.id];
        delete roomList[socket.id];
        cb(null, null);
      } //////////////////////////////////////////////////////////////////////////////////////
    ], function(err, res) {
      if (err) {
        console.log(err.id + " : " + err.message);
      }      
    }); ///////////////////////////////////////////////////////////////////////////////////////
    var currRoom = roomList[socket.id];
    currRoom.countUsers = (currRoom.countUsers > 0)? (currRoom.countUsers - 1) : 0;
    delete roomList[socket.id];
    socket.disconnect(); // отключаемся
  });
} // Выходим из чата

//////////////////////// КОМНАТЫ ////////////////////////////////////////////////////////////////////////
// Отправить список комнат
function getRoomList(socket, rooms) {
  socket.on('getRoomList', function() {
    if(!checkAutho(socket.id)) {
      var errInfo = {id : 0, message : "Вы не авторизированы" };
      socket.emit('error', errInfo);
      return;
    }
    var nameRooms = [];
    for (var index in rooms) {
      var roomInfo = { name: rooms[index].name, countUsers : rooms[index].countUsers};
      nameRooms.push(roomInfo);
    }

    views.renderView('showRooms', nameRooms, function(err, content) {
      if (err) {
        console.log(err.id + " : " + err.message);
        var errInfo = { id: err.id, message: err.message };
        socket.emit('error', errInfo);
        return;
      }

      socket.emit('showRooms', content);
    });

  });
}
// Сменить комноту
function changeRoom(socket, roomList, rooms) {
  socket.on('toRoom', function(roomName) {
    if(!checkAutho(socket.id)) {
      var errInfo = {id : 0, message : "Вы не авторизированы" };
      socket.emit('error', errInfo);
      return;
    }

    var game = roomList[socket.id].game;
    var room = roomList[socket.id];

    waterfall ([
      function(cb) { /////////////////////////////////////////////////////////////////////
        game.deleteGamer(socket.id, function(err, gamer, gameName, result) {
          if (err) { return cb(err, null); }

          //socket.emit('game', true, gameName, null, null);
          //socket.broadcast.to(room.name).emit('game', false, gameName, null, null);

          emitGameOne(socket, true, gameName, result, null, function(err) {
            if(err) { return cb(err, null); }
            if (!gamer) { return cb(null, null) }

            emitGameInRoom(socket, room.name, true, gameName, result, null, function(err){
              if(err) { return cb(err, null); }

              cb(null, null);
            });
          });
        });
      }, /////////////////////////////////////////////////////////////////////
      function(res, cb) {
        if (roomName == "newRoom") {
          countRoom ++;
          var newRoom = {
            name: "Room" + countRoom,
            countUsers: 1,
            messages: [],
            game: new gamejs()
          };
          rooms["room" + countRoom] = newRoom;
          roomList[socket.id].countUsers --;
          roomList[socket.id] = newRoom;
          socket.join("Room" + countRoom);

          socket.join(newRoom.name);
          socket.leave(room.name);

          adminInfo['message'] = "Вы создали новую комнату " + newRoom.name;
          cb(null, null);
        } else {
          for(var index in rooms) {
            if(rooms[index].name == roomName) {
              rooms[index].countUsers ++;
              roomList[socket.id].countUsers --;
              roomList[socket.id] = rooms[index];

              socket.join(roomName);
              socket.leave(room.name);

              showLastMessages(socket,rooms[index], function(err) {
                if(err) { return cb(err, null); }

                adminInfo['message'] = "Вы перешли в комнату " + roomName;
                cb(null, null);
              });
            }
          }
        }
      },/////////////////////////////////////////////////////////////////////
      function(res, cb) {
        sendOne(socket, adminInfo, function(err) {
          if(err) { return cb(err, null); }

          cb(null, null);
        })
      }/////////////////////////////////////////////////////////////////////
    ], function(err, res) {
      if(err) {
        console.log(err.id + ' ' + err.message);
        var errInfo = {id : err.id, message : err.message };
        socket.emit('error', errInfo);
      }
    });
  });
}
///////////////////////  ПРОФИЛЬ ////////////////////////////////////////////////////////////////////////
// Получение профиля для редактирования (своего) или просмотра (чужого)
function showProfile(socket, userList,  profiles) {
  socket.on('showProfile', function(uid) {

    if(!checkAutho(socket.id)) {
      var errInfo = {id : 0, message : "Вы не авторизированы" };
      socket.emit('error', errInfo);
      return;
    }

    if (uid == 'admin') {
      socket.emit('showProfile', adminInfo);
      return;
    }

    waterfall([
        function(cb) { // Получаем параметры профиля
          if(!isNumeric(uid) && uid != null) { return cb(new Error("Получен некорректный Id пользователя")); }
           var profile = (uid) ? profiles[uid] : userList[socket.id];
            profile.getInfo(function(err, info) {
            if (err) { return cb(err, null) }

            cb(null, profile, info);
          });
        }, ///////////////////////////////////////////////////////////
        function(profile, info, cb) { // Получаем список подарков
          profile.getGifts(function(err, gifts) {
            if (err) { return cb(err, null) }

            info.gifts = gifts;
            cb(null, profile, info);
          });
        },//////////////////////////////////////////////////////////////
        function(profile, info, cb) { // Получаем историю
          profile.getHistory(null, function(err, history) {
            if (err) {return cb(err, null) }

            info.history = history;
            cb(null, profile, info);
          });
        },//////////////////////////////////////////////////////////////////
        function(profile, info, cb) { // Получаем список друзей
          profile.getFriends(function(err, friends) {
            if (err) {return cb(err, null) }

            info.friends = friends;
            cb(null, info);
          });
        },//////////////////////////////////////////////////////////////////
        function(info, cb) { // Отправляем данные пользователя
          userList[socket.id].getInfo(function(err, selfInfo) {
            if (err) { return cb(err, null); }

            if(selfInfo.id == info.id) { info.isEdit = true;} // запрошен свой
            else { info.isEdit = false; } // запрошен чужой

            views.renderView('showProfile', info, function(err, content) {
              if (err) { return cb(err, null); }

              socket.emit('showProfile', content);
              cb(null, null);
            });
          });
        } /////////////////////////////////////////////////////////////
    ], function(err) { // Вызывается последней.  Отправляем данные о профиле, или обрабатываем ошибки
      if (err) {
        console.log(err.id + " : " + "Ошибка при отображении профиля: " + err.message);
        var errInfo = { id : err.id, message : "Ошибка при отображении профиля: " + err.message };
        socket.emit('error', errInfo);
      }
    }); // waterfall
  }); // socket.emit
}

// Сохранение сведений о пользователе
function saveProfile(socket, userList) {
  socket.on('saveProfile', function(info) {
    if(!checkAutho(socket.id)) {
      var errInfo = {id : 0, message : "Вы не авторизированы" };
      socket.emit('error', errInfo);
      return;
    }
    waterfall([
        function(cb) { // Задаем опции и проверяем
          var options = { // Здесь можно сделать проверку
            name      : info.name     || '',
            avatar    : info.avatar   || '',
            age       : info.age      || '',
            location  : info.location || '',
            status    : info.status   || '',
            gender    : info.gender   || ''
          };
          if (options.name == '') { return cb(new Error("Не задано имя пользователя"), null); }
          cb(null, options);
        }, ////////////////////////////////////////////////////////////////////////
        function(options, cb) { // Сохраняем изменения в профиль
          userList[socket.id].setInfo(options, function(err, res) {
            if (err) { return cb(err, null); }

            cb(null, null);
          });
        },////////////////////////////////////////////////////////////////////////
        function(res, cb) { // Сохраняем профиль в базу
          userList[socket.id].save(function(err, id) {
            if (err) { return cb(err, null); }

            cb(null, null);
          });
        }, ////////////////////////////////////////////////////////////////////////
        function(res, cb) { // Данные успрешно сохранены, сообщаем пользователю
          adminInfo['message'] = "Профиль пользователя успешно сохранен";
          sendOne(socket, adminInfo, function(err) {
            if(err) { return cb(err, null); }

            cb(null, null);
          });
        }
    ], function(err, res){ // Вызвается последней. Обрабатываем ошибки
      if(err) {
        console.log(err.id + " : " + "Ошибка при сохранении профиля: " + err.message);
        var errInfo = { id : err.id, message : "Ошибка при сохранении профиля: " + err.message };
        socket.emit('error', errInfo);
      }

    }); // waterfall
  }); // socket.on
}
////////////////////////// ИГРА  /////////////////////////////////////////////////////////////////////////
// Начинаем игру, игроки добавляются в список игроков, если нужное количество набрано -
// начинается игра
function startGame(socket) {
  socket.on('startGame', function() {
    if(!checkAutho(socket.id)) {
      var errInfo = {id : 0, message : "Вы не авторизированы" };
      socket.emit('error', errInfo);
      return;
    }
    waterfall([
        function(cb) { // Готовим данные и добавляем пользователя и игру
          var game = roomList[socket.id].game;
          var gamer = { id : socket.id, profile : userList[socket.id]};
          game.addGamer(gamer, function(err, gamer, gameName, result) {
            if (err) { return cb(err, null);}

            cb(null, gamer, gameName, result);
          });
        }, ///////////////////////////////////////////////////////////////////////////
        function(gamer, gameName, result, cb) { // Если ничего не вернулось, ждем начала, либо начинаем игру
          if(!gamer) {
            adminInfo['message'] = "Вы присоединились к игре, ожидайте начала";

            sendOne(socket, adminInfo, function(err) {
              if(err) { return cb(err, null); }

              cb(null, null, null, null, null);
            });
          } else
          if(!gameName) { cb(new Error("Указан игрок, но не указана игра"));  }
          else {
            var currGamer = gamer.profile;
            var currSocket = io.sockets.sockets[gamer.id];
            var currRoom = roomList[currSocket.id];

            //currSocket.emit('game', true, gameName);
            //currSocket.broadcast.to(currRoom.name).emit('game', false, gameName);
            emitGameOne(currSocket, true, gameName, result, null, function(err) {
              if(err) { return cb(err, null); }

              emitGameInRoom(currSocket, currRoom.name, false, gameName, result, null, function(err){
                if(err) { return cb(err, null); }

                cb(null, gamer, currGamer, currSocket, currRoom);
              });
            });
          }
          //currSocket.broadcast.to(currRoom.name).emit('game', false, gameName);
        }, ///////////////////////////////////////////////////////////////////////////////
        function(gamer, currGamer, currSocket, currRoom, cb) { // Сообщяем о начале игры и ведущем игроке
          if( gamer ) {
            currGamer.getInfo(function(err, info){
              if (err) { return cb(err, null) }

              cb(null,  currSocket, currRoom, info);
            });
          } else cb(null, null, null, null);
        },////////////////////////////////////////////////////////////////////////////////////
        function(currSocket, currRoom, info, cb) {
          if(currSocket) {
            adminInfo['message'] = "Игра началась, ход за Вами";
            sendOne(currSocket, adminInfo, function(err) {
              if(err) { return cb(err, null); }

              cb(null, currSocket, currRoom, info);
            });
          } else cb(null, null, null, null);
        },////////////////////////////////////////////////////////////////////////////////////
        function(currSocket, currRoom, info, cb) {
          if(currSocket) {
            adminInfo['message'] = "Игра началась, ход за игроком " + info.name;
            sendInRoom(currSocket, currRoom, adminInfo, function(err) {
              if(err) { return cb(err, null); }

              cb(null, null);
            });
          } else cb(null, null);
        }////////////////////////////////////////////////////////////////////////////////////
    ], function(err, res) { // Вызвается последней, обрабатываем ошибки
      if (err) {
        console.log(err.id + " : " + "Ошибка при добавлении игрока: " + err.message);
        var errInfo = { id : err.id, message : "Ошибка при добавлении игрока: " + err.message };
        socket.emit('error', errInfo);
      }
    }); // waterfall
  }); //socket.on
}

// Игра, на клики игроков присходит обращение к текующей игре с передачей параметров
// результат передается клиенту
function turnGame(socket) {
  socket.on('turnGame', function(options) {
    if(!checkAutho(socket.id)) {
      var errInfo = {id : 0, message : "Вы не авторизированы" };
      socket.emit('error', errInfo);
      return;
    }
    waterfall([
        function(cb) { // Играем, получаем ведущего игрока и следующую игру
          var game = roomList[socket.id].game;

          if(!game) { cb(new Error("Такой игрок не участвует в игре"));}

          game.playNext(socket.id, options, function(err, gamer, gameName, result) {
            if (err) { return cb(err, null); }

            cb(null, gamer, gameName, result);
          });
        }, ////////////////////////////////////////////////////////////////////
        function(gamer, gameName, result, cb) { // Передаем результаты
          var currSocket = io.sockets.sockets[gamer.id];
          var currRoom = roomList[currSocket.id];
          gamer.profile.getInfo(function(err, info) {
            if(err) { cb(err, null) }

            //currSocket.emit('game', true, gameName, result, info);
            //currSocket.broadcast.to(currRoom.name).emit('game', false, gameName, result, info);
            /*
            emitGameOne(currSocket, true, gameName, result, info, function(err) {
              if(err) { return cb(err, null); }

              emitGameInRoom(currSocket, currRoom.name, false, gameName, result, info, function(err){
                if(err) { return cb(err, null); }

                cb(null, gamer);
              });
            }); */
            emitGame(currSocket, null, true, game, result, function(err) {
              if(err) { return cb(err, null); }
              emitGame(currSocket, currRoom.name, false, game, result, function(err) {
                if(err) { return cb(err, null); }

                cb(null, gamer);
              })
            })
          });
        }, ///////////////////////////////////////////////////////////////////////
        function(gamer, cb) { // Сообщаем о следующем ходе
          var currGamer = gamer.profile;
          var currSocket = io.sockets.sockets[gamer.id];
          var currRoom = roomList[currSocket.id];
          currGamer.getInfo(function(err, info){
            if (err) { return cb(err, null) }

            cb(null, currSocket, currRoom, info);
          });
        },////////////////////////////////////////////////////////////////////
        function(currSocket, currRoom, info, cb) {
          adminInfo['message'] = "Ход за Вами";
          sendOne(currSocket, adminInfo, function(err) {
            if (err) { return cb(err, null); }

            cb(null, currSocket, currRoom, info);
          });
        },////////////////////////////////////////////////////////////////////
        function(currSocket, currRoom, info, cb) {
          adminInfo['message'] = "Ход за играком " + info.name;
          sendInRoom(currSocket, currRoom, adminInfo, function(err) {
            if (err) { return cb(err, null); }

            cb(null, null);
          });
        }////////////////////////////////////////////////////////////////////
    ], function(err, res) { // Вызвается последней, обрабатываем ошибки
      if (err) {
        console.log(err.id + " : " + "Ошибка в ходе игры: " + err.message);
        var errInfo = { id : err.id, message : "Ошибка в ходе игры: " + err.message };
        socket.emit('error', errInfo);
      }
    }); // waterfall
  }); // socket.on
}

// Остановка игры, удаляем игрока из игры и сообщаем об этом всем в комнате
function stopGame(socket) {
  socket.on('stopGame', function(){
    if(!checkAutho(socket.id)) {
      var errInfo = {id : 0, message : "Вы не авторизированы" };
      socket.emit('error', errInfo);
      return;
    }
    waterfall([
      function(cb) { // Выходим из игры
        var game = roomList[socket.id].game;
        game.deleteGamer(socket.id, function(err, gamer, gameName) {
          if (err) { return cb(err, null); }

          var currGamer = gamer.profile;
          var currSocket = io.sockets.sockets[gamer.id];
          var currRoom = roomList[currSocket.id];

          //currSocket.emit('game', true, gameName, result, info);
          //currSocket.broadcast.to(currRoom.name).emit('game', false, gameName, result, info);

          emitGameOne(currSocket, true, gameName, result, info, function(err) {
            if(err) { return cb(err, null); }

            emitGameInRoom(currSocket, currRoom.name, false, gameName, result, info, function(err){
              if(err) { return cb(err, null); }

              cb(null, gamer, currGamer, currSocket, currRoom);
            });
          });
        });
      }, ///////////////////////////////////////////////////////////////////////
      function(gamer, currGamer, currSocket, currRoom, cb) { // Сообщаем о выходе игрока из игры
        if(!gamer) { return cb(new Error("Не задан игрок, невозможно отправить сообщение"))}


        currGamer.getInfo(function(err, info){
          if (err) { return cb(err, null) }

          cb(null, currSocket, currRoom, info);
        });
      },////////////////////////////////////////////////////////////////////
      function(currSocket, currRoom, info, cb) {
        adminInfo['message'] = "Вы вышли из игры";
        sendOne(currSocket, adminInfo, function(err) {
          if (err) { return cb(err, null); }

          cb(null, currSocket, currRoom, info);
        });
      },////////////////////////////////////////////////////////////////////
      function(currSocket, currRoom, info, cb) {
        adminInfo['message'] = info.name + " вышел из игры";
        sendInRoom(currSocket, currRoom, adminInfo, function(err) {
          if (err) { return cb(err, null); }

          cb(null, null);
        });
      }////////////////////////////////////////////////////////////////////
    ], function(err, res) { // Вызвается последней, обрабатываем ошибки
      if (err) {
        console.log(err.id + " : " + "Ошибка при выходе из игры: " + err.message);
        var errInfo = { id : err.id, message : "Ошибка при выходе из игры: " + err.message };
        socket.emit('error', errInfo);
      }
    }); // waterfall
  }); // socket.on
}
/////////////////////////// ПОДАРКИ ////////////////////////////////////////////////////////////////////////
// Подарок пользователю, добавляем его в профиль и сообщаем тому, кому подарили
function makeGift(socket) {
  socket.on('makeGift', function(giftId, recId, message) {
    if(!checkAutho(socket.id)) {
      var errInfo = {id : 0, message : "Вы не авторизированы" };
      socket.emit('error', errInfo);
      return;
    }
    var date = new Date();
    waterfall([
      function(cb) { // Ищим подарок с таким id
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
        var profile = profiles[recId];
        if (profile) {
          userList[socket.id].getInfo(function(err, info){
            if (err) { return cb(err, null); }

            cb(null, gift, info);
          });
        } else { return cb(new Error("Вы не авторизированы и не можете обмениваться сообщениями"), null); }
      }, /////////////////////////////////////////////////////////////////////////////////
      function(gift, info, cb) { // Получаем данные получателя и готовим сообщение к добавлению в историю
        profiles[recId].getInfo(function(err, recipInfo) {
          if (err) { return cb(err, null); }

          var savingMessage = { // Для получателя
            username  : recipInfo.name,
            date      : date,
            companion : info.id,
            companionname : info.name,
            incoming  : true,
            text      : message,
            gift      : gift.data
          };
          cb(null, gift, savingMessage, info, recipInfo);
        });
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

///////////////////////////////////// ДРУЗЬЯ ////////////////////////////////////////////////////////////////
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
// Отправить сообщение всем
function sendAll(socket, message, callback) {

  views.renderView('message', message, function(err, content) {
    if (err) {return callback(err, null);}

    socket.broadcast.to().emit('message', content);

    if (message.id != adminInfo.id) {
      var currRoom = roomList[socket.id];
      currRoom.messages.push(message);
      if (currRoom.messages.length >= lenQueue) {
        currRoom.messages.shift();
      }
    }
    callback(null, null);
  });
}

// Отправить сообщение всем в комнате
function sendInRoom(socket, room, message, callback) {
  views.renderView('message', message, function(err, content) {
    if (err) {return callback(err, null);}

    socket.broadcast.to(room.name).emit('message', content);

    if (message.id != adminInfo.id) {
      room.messages.push(message);

      if (room.messages.length >= lenQueue) {
        room.messages.shift();
      }
    }
    callback(null, null);
  });
}

// Отправить сообщение одному
function sendOne(socket, message, callback) {
  views.renderView('message', message, function(err, content) {
    if (err) {return callback(err, null);}

    socket.emit('message', content);
    callback(null, null);
  });
}

// Показать последние сообщения
function showLastMessages(socket, room, callback) {
  var messages = room.messages;
  if(!messages[0]) return callback(null, null);

  async.map(messages, function(item, cb) {
    sendOne(socket, item, function(err) {
      if (err) { return cb(err, null) }

      cb(null, null);
    });
  }, function(err) {
      if (err) { return callback(err, null); }

      callback(null, null);
  });
}

function emitGameOne(socket, active, game, result, info, callback) {
  views.renderView(game, null, function(err, content) {
    if (err) {return callback(err, null);}

    socket.emit('game', game, active, content, result, info);
    callback(null, null);
  });
}

function emitGameInRoom(socket, room, active, game, result, info, callback) {
  views.renderView(game, null, function (err, content) {
    if (err) {
      return callback(err, null);
    }

    socket.broadcast.to(room).emit('game', game, active, content, result, info);
    callback(null, null);
  });
}

function emitGame(socket, room, active, game, result, callback) {
  var guysInfo = [];
  var girlsInfo = [];
  waterfall([
      function(cb) {
        roomList[socket.id].game.getGuys(function(err, guys) {
          async.map(guys, function(guy, cb_inmap) {
            guy.profile.getInfo(function(err, info) {
              if (err) { return cb_inmap(err, null); }

              guysInfo.push(info);
              cb_inmap(null, null);
            });
          }, function(err, results){
            if (err)  { return cb(err, null); }
            cb(null, null);
          });
        });
      },
      function(res, cb) {
        roomList[socket.id].game.getGirls(function(err, girls) {
          async.map(girls, function(girl, cb_inmap) {
            guy.profile.getInfo(function(err, info) {
              if (err) { return cb_inmap(err, null); }

              girlsInfo.push(info);
              cb_inmap(null, null);
            });
          }, function(err, results){
            if (err)  { return cb(err, null); }
            cb(null, null);
          });
        });
      },
    function(res, cb) {
      var data = { guys: guysInfo, girls : girlsInfo };
      views.renderView('gameField', data, function (err, field) {
        if (err) { return callback(err, null); }

        callback(null, field);
      });
    },
    function(field, cb) {
      views.renderView(game, data, function (err, content) {
        if (err) { return callback(err, null); }

        if(room)
          socket.broadcast.to(room).emit('game', game, active, content, result, field);
        else
          socket.emit('game', game, active, content, result, field);

        callback(null, null);
      });
    }
  ], function(err, res) {
    if(err) { callback(err, null); }
  });
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