var async     =  require('async');
// Свои модули
var GameError = require('../../game_error'),
  checkInput = require('../../check_input');
var getRoomInfo = require('./get_room_info');

/*
 Показать список комнат (столов)
 - Получаем данные профиля
 - Узанем пол
 - Выбираем все комнаты со свободными местами для нашего пола и для каждой
 -- Получаем ее идентификтор и инфу по парням и девушкам (какую ???)
 - Передаем клиенту
 */
module.exports = function (socket, userList, rooms) {
  socket.on('get_rooms', function() {
    if (!checkInput('get_rooms', socket, userList, null))
      return new GameError(socket, "getROOMS", "Верификация не пройдена");

    var len = '';
    if (userList[socket.id].getSex() == require('./../constants_io').GUY) {
      len = 'guys_count';
    } else {
      len = 'girls_count';
    }

    var resRooms = [];
    async.map(rooms, function (item, cb) {
      if (item[len] < require('./../constants_io').ONE_GENDER_IN_ROOM) {
        getRoomInfo(item, function (err, info) {
          if (err) { return cb(err, null); }

          resRooms.push(info);
          cb(null, null);
        });
      } else cb(null, null);
    }, function (err, results) {
      if (err) { return new GameError(socket, 'getROOMS', err.message) }

      socket.emit('get_rooms', resRooms);
    });
  });
};


