// Свои модули
var GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    defineSex  = require('./define_sex'),
    getRoomInfo = require('./get_room_info'),
    constants  = require('../constants');

/*
 Показать список комнат (столов)
 - Получаем данные профиля
 - Узанем пол
 - Выбираем все комнаты со свободными местами для нашего пола и для каждой
 -- Получаем ее идентификтор и инфу по парням и девушкам (какую ???)
 - Передаем клиенту
 */
module.exports = function (socket, userList, rooms) {
  socket.on(constants.IO_GET_ROOMS, function() {
    if (!checkInput(constants.IO_GET_ROOMS, socket, userList, {})) { return; }

    var sex = defineSex(userList[socket.id]);

    var resRooms = [];
    var count = 0;
    pushRoom(rooms, count, resRooms, sex, function(err, res) {
      if (err) { return new GameError(socket, constants.IO_GET_ROOMS, err.message) }

      socket.emit(constants.IO_GET_ROOMS, resRooms);
    });
  });
};

function pushRoom(rooms, count, resRooms, sex, callback) {
  if (rooms[count][sex.len] < constants.ONE_SEX_IN_ROOM) {
    getRoomInfo(rooms[count], function (err, info) {
      if (err) { return callback(err, null); }

      resRooms.push(info);

      count++;

      if(count < rooms.length) {
        pushRoom(rooms, count, resRooms, sex, callback);
      } else {
        callback(null, null);
      }
    });
  } else {
    count++;

    if(count < rooms.length) {
      pushRoom(rooms, count, resRooms, sex, callback);
    } else {
      callback(null, null);
    }
  }
}
