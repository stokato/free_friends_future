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
module.exports = function (socket, userList, rooms, roomList) {
  socket.on(constants.IO_GET_ROOMS, function(options) {
    if (!checkInput(constants.IO_GET_ROOMS, socket, userList, options)) { return; }

    var sex = defineSex(userList[socket.id]);

    var resRooms = [];
    var count = 1;

    var selfRoom = roomList[socket.id];

    for(var item in rooms) if(rooms.hasOwnProperty(item)) {
      if (rooms[item][sex.len] < constants.ONE_SEX_IN_ROOM && rooms[item].name != selfRoom.name) {

        count++;
        getRoomInfo(rooms[item], function (err, info) {
          if (err) { return handError(options, err.message); }

          resRooms.push(info);

          //count--;
          //
          //if(count == 0) {
          //  socket.emit(constants.IO_GET_ROOMS, resRooms);
          //}
          checkComplete();
        });

      }
    }

    checkComplete();

    //-------------------------
    function checkComplete() {
      count--;

      if(count == 0) {

        socket.emit(constants.IO_GET_ROOMS, {
          rooms : resRooms,
          operation_status : constants.RS_GOODSTATUS
        });

      }
    }


    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_GET_ROOMS, res);

      new GameError(socket, constants.IO_GET_ROOMS, err.message || constants.errors.OTHER.message);
    }
  });
};
