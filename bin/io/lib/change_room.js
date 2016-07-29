// Свои модули
var GameError = require('../../game_error'),      // Ошибки
    checkInput = require('../../check_input'),    // Верификация
    constants = require('./../constants'),     // Константы
    defineSex = require ('./define_sex'),
    createRoom = require('./create_room'),
    getLastMessages = require('./get_last_messages'),
    sanitize        = require('../../sanitizer'),
    getRoomInfo = require('./get_room_info');
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
module.exports = function (socket, userList, rooms, roomList) {
  socket.on(constants.IO_CHANGE_ROOM, function(options) {
    if (!checkInput(constants.IO_CHANGE_ROOM, socket, userList, options)) {
      return;
    }
    //var f = constants.FIELDS;
    if(!rooms[options.room] && options.room != constants.NEW_ROOM) {
      return new GameError(socket, constants.IO_CHANGE_ROOM, "Некорректный идентификатор комнаты");
    }
    if(roomList[socket.id].name == options.room){
      return new GameError(socket, constants.IO_CHANGE_ROOM,
                                                      "Пользователь уже находится в этой комнате");
    }

    options.room = sanitize(options.room);

    var newRoom = null;
    var currRoom = roomList[socket.id];
    var selfProfile = userList[socket.id];

    var sex = defineSex(selfProfile);

    if (options.room == constants.NEW_ROOM) { // Либо создаем новую комнату
      newRoom = createRoom(socket, userList);
      rooms[newRoom.name] = newRoom;
    } else {                                  // Либо ищем указанную
      var item;
      for (item in rooms) if (rooms.hasOwnProperty(item)) {
        if (rooms[item].name == options.room) {
          if (rooms[item][sex.len] >= constants.ONE_SEX_IN_ROOM) {
            return new GameError(socket, constants.IO_CHANGE_ROOM,
                                                  "Попытка открыть комнату в которой нет места");
          }
          newRoom = rooms[item];

          getLastMessages(socket, rooms[item]);
        }
      }
    }

    if (!newRoom) {
      return new GameError(socket, constants.IO_CHANGE_ROOM, "Попытка открыть несуществующую комнату")
    }

    //if(selfProfile.getReady()) {
    //  roomList[socket.id].game.stop();
    //}

    newRoom[sex.sexArr][selfProfile.getID()] = selfProfile;
    newRoom[sex.len]++;

    selfProfile.setGame(newRoom.game);
    var index = newRoom[sex.counter];
    selfProfile.setGameIndex(index);
    newRoom[sex.counter] += 2;

    roomList[socket.id] = newRoom;

    var isCurrRoom = true;

    delete currRoom[sex.sexArr][selfProfile.getID()];
    currRoom[sex.len]--;
    if (currRoom.guys_count == 0 && currRoom.girls_count == 0) {
      delete rooms[currRoom.name];
      isCurrRoom = false;
    }

    getRoomInfo(newRoom, function (err, info) {
      if (err) { return new GameError(socket, constants.IO_CHANGE_ROOM, err.message); }

      var message = {};
      message.id      = selfProfile.getID();
      message.vid     = selfProfile.getVID();
      message.age     = selfProfile.getAge();
      message.sex     = selfProfile.getSex();
      message.city    = selfProfile.getCity();
      message.country = selfProfile.getCountry();
      message.points  = selfProfile.getPoints();

      //socket.broadcast.in(currRoom.name).emit('leave', message);

      socket.leave(currRoom.name);
      socket.join(newRoom.name);

      //socket.broadcast.in(newRoom.name).emit('join', message);

      //socket.emit(constants.IO_CHANGE_ROOM, info);

      socket.broadcast.in(newRoom.name).emit(constants.IO_ROOM_USERS, info);
      socket.emit(constants.IO_ROOM_USERS, info);

      newRoom.game.start(socket);

      if(isCurrRoom) {
        getRoomInfo(currRoom, function(err, currRoomInfo) {
          if(err) { return new GameError(socket, constants.IO_CHANGE_ROOM, err.message); }

          socket.broadcast.in(currRoom.name).emit(constants.IO_ROOM_USERS, currRoomInfo);
        });
      }
    });
  });
};

