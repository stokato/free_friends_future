// Свои модули
var GameError = require('../../game_error'),      // Ошибки
    checkInput = require('../../check_input'),    // Верификация
    constants = require('./../constants_io'),     // Константы
    defineSex = require ('./define_sex'),
    createRoom = require('./create_room'),
    getLastMessages = require('./get_last_messages'),
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
  socket.on('change_room', function(options) {

    if (!checkInput('change_room', socket, userList, options)) {
      return new GameError(socket, "CHANGEROOM", "Верификация не пройдена");
    }
    if(!rooms[options.room] && options.room != "new_room") {
      return new GameError(socket, "CHANGEROOM", "Некорректный идентификатор комнаты");
    }
    if(roomList[socket.id].name == options.room){
      return new GameError(socket, "CHANGEROOM", "Пользователь уже находится в этой комнате");
    }

    var newRoom = null;
    var currRoom = roomList[socket.id];
    var profile = userList[socket.id];

    var sex = defineSex(profile);

    if (options.room == "new_room") {
      newRoom = createRoom(socket, userList);
      rooms[newRoom.name] = newRoom;
    } else {
      var item;
      for (item in rooms) if (rooms.hasOwnProperty(item)) {
        if (rooms[item].name == options.room) {
          if (rooms[item][sex.len] >= constants.ONE_GENDER_IN_ROOM) {
            return new GameError(socket, "CHANGEROOM", "Попытка открыть комнату в которой нет места");
          }
          newRoom = rooms[item];

          getLastMessages(socket, rooms[item]);
        }
      }
    }
    if (!newRoom) {
      return new GameError(socket, "CHANGEROOM", "Попытка открыть несуществующую комнату")
    }

    newRoom[sex.sexArr][profile.getID()] = profile;
    newRoom[sex.len]++;

    roomList[socket.id] = newRoom;

    delete currRoom[sex.sexArr][profile.getID()];
    currRoom[sex.len]--;
    if (currRoom.guys_count == 0 && currRoom.girls_count == 0) delete rooms[currRoom.name];

    getRoomInfo(newRoom, function (err, info) {
      if (err) { return new GameError(socket, "CHANGEROOM", err.message); }

      var message = {
        id : profile.getID(),
        vid : profile.getVID(),
        age : profile.getAge(), //
        sex : profile.getSex(),
        city : profile.getCity(),
        country : profile.getCountry
      };
      socket.broadcast.in(currRoom.name).emit('leave', message);

      socket.leave(currRoom.name);
      socket.join(newRoom.name);

      socket.broadcast.in(newRoom.name).emit('join', message);

      socket.emit('open_room', info);
    });
  });
};

