
// Свои модули
var GameError = require('../../game_error'),      // Ошибки
    checkInput = require('../../check_input'),    // Верификация
    constants = require('./../../constants'),     // Константы
    defineSex = require ('./define_sex'),
    createRoom = require('./create_room'),
    getLastMessages = require('./get_last_messages'),
    getRoomInfo = require('./get_room_info'),
    sendUsersInRoom = require('./send_users_in_room');

var oPool = require('./../../objects_pool');

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
module.exports = function (socket) {
  socket.on(constants.IO_CHANGE_ROOM, function(options) {
    if (!checkInput(constants.IO_CHANGE_ROOM, socket, options)) { return; }

    if(!oPool.rooms[options.room] && options.room != constants.NEW_ROOM) {
      return handError(constants.errors.NO_SUCH_ROOM);
    }

    if(oPool.roomList[socket.id].name == options.room){
      return handError(constants.errors.ALREADY_IN_ROOM);
    }

    //options.room = sanitize(options.room);

    var newRoom = null;
    var currRoom = oPool.roomList[socket.id];
    var selfProfile = oPool.userList[socket.id];

    var sex = defineSex(selfProfile);

    if (options.room == constants.NEW_ROOM) { // Либо создаем новую комнату
      newRoom = createRoom(socket, oPool.userList);
      oPool.rooms[newRoom.name] = newRoom;

    } else {                                  // Либо ищем указанную
      var item;
      for (item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)) {
        if (oPool.rooms[item].name == options.room) {
          if (oPool.rooms[item][sex.len] >= constants.ONE_SEX_IN_ROOM) {
            return handError(constants.errors.ROOM_IS_FULL);
          }
          newRoom = oPool.rooms[item];

          getLastMessages(socket, oPool.rooms[item]);
        }
      }
    }

    if (!newRoom) {
      return handError(options, "Попытка открыть несуществующую комнату", 422);
    }

    //if(selfProfile.getReady()) {
    //  oPool.roomList[socket.id].game.stop();
    //}

    newRoom[sex.sexArr][selfProfile.getID()] = selfProfile;
    newRoom[sex.len]++;

    selfProfile.setGame(newRoom.game);

    oPool.roomList[socket.id] = newRoom;

    var isCurrRoom = true;

    delete currRoom[sex.sexArr][selfProfile.getID()];
    currRoom[sex.len]--;
    if (currRoom.guys_count == 0 && currRoom.girls_count == 0) {
      delete oPool.rooms[currRoom.name];
      isCurrRoom = false;
    }
    currRoom[sex.indexes].push(selfProfile.getGameIndex());
  
    var indexes = newRoom[sex.indexes];
    indexes.sort(function (i1, i2) { return i1 - i2; });
    selfProfile.setGameIndex(indexes[0]);
    indexes.splice(0, 1);

    getRoomInfo(newRoom, function (err, info) {
      if (err) { return new GameError(socket, constants.IO_CHANGE_ROOM, err.message); }
      

      socket.leave(currRoom.name);
      socket.join(newRoom.name);
      

      sendUsersInRoom(info, null, function(err, res) {
        if(err) { return handError(err) }

        newRoom.game.start(socket);

        socket.emit(constants.IO_CHANGE_ROOM, { operation_status : constants.RS_GOODSTATUS });

        if(newRoom.track_list.length > 0) {
          var passedTime = Math.round((new Date() - room.trackTime) * 0.001);
          var trackInfo = { track : newRoom.track_list[0], passed_time : passedTime };
          socket.emit(constants.IO_START_TRACK, trackInfo);
        }

      });
      

      if(isCurrRoom) {
        getRoomInfo(currRoom, function(err, currRoomInfo) {
          if(err) { return handError(err); }

          sendUsersInRoom(currRoomInfo, null, function(err) {
            if(err) { return handError(err); }

          });

        });
      }
    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_CHANGE_ROOM, res);

      new GameError(socket, constants.IO_CHANGE_ROOM, err.message || constants.errors.OTHER.message);
    }

  });
};

