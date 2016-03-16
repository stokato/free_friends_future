var async     =  require('async');

var GameError = require('../../game_error'),      // Ошбики
    checkInput = require('../../check_input'),    // Верификация
    constants = require('./../constants'),     // Константы
    defineSex = require('./define_sex');

module.exports = function(socket, userList, profiles, roomList, rooms) {
  if (!checkInput(constants.IO_DISCONNECT, socket, userList, null)) { return; }

  var selfProfile = userList[socket.id];
  var f = constants.FIELDS;
  async.waterfall([
    ///////////////////////////////////////////////////////////////////////////////////
    function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
      var info = {};
      info[f.id]  = selfProfile.getID();
      info[f.vid] = selfProfile.getVID();

      socket.broadcast.emit(constants.IO_OFFLINE, info);

      cb(null, null);
    }, ///////////////////////////////////////////////////////////////////////////////////////
    function (res, cb) { // сохраняем профиль в базу
      selfProfile.save(function (err) {
        if (err) {  return cb(err, null);  }

        cb(null, null);
      });
    }, /////////////////////////////////////////////////////////////////////////////////////
    function (res, cb) { // удалеяем профиль и сокет из памяти
      delete userList[socket.id];

      var sex = defineSex(selfProfile);

      if (roomList[socket.id]) {
        var roomName = roomList[socket.id].name;
        delete roomList[socket.id][sex.sexArr][selfProfile.getID()];
        roomList[socket.id][sex.len]--;
        delete roomList[socket.id];
        delete profiles[selfProfile.getID()];
        if (rooms[roomName].guys_count == 0 && rooms[roomName].girls_count == 0) {
          delete rooms[roomName];
        }
      }
      cb(null, null);
    } //////////////////////////////////////////////////////////////////////////////////////
  ], function (err) {
    if (err) { new GameError(null, constants.IO_DISCONNECT, err.message)  }

    //callback(null, null);
    socket.disconnect(); // отключаемся
  }); ///////////////////////////////////////////////////////////////////////////////////////
};
