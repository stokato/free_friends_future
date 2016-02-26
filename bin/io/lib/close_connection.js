var async     =  require('async');

var GameError = require('../../game_error'),      // Ошбики
    checkInput = require('../../check_input'),    // Верификация
    constants = require('./../constants_io'),     // Константы
    defineSex = require('./define_sex');

module.exports = function(socket, userList, profiles, roomList, rooms) {
  if (!checkInput('exit', socket, userList, null)) {
    return new GameError(socket, "EXIT", "Верификация не пройдена");
  }

  var profile = userList[socket.id];
  async.waterfall([
    ///////////////////////////////////////////////////////////////////////////////////
    function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
      var info = {id: profile.getID(), vid: profile.getVID()};

      socket.broadcast.emit('offline', info);

      cb(null, null);
    }, ///////////////////////////////////////////////////////////////////////////////////////
    function (res, cb) { // сохраняем профиль в базу
      profile.save(function (err) {
        if (err) {  return cb(err, null);  }

        cb(null, null);
      });
    }, /////////////////////////////////////////////////////////////////////////////////////
    function (res, cb) { // удалеяем профиль и сокет из памяти
      delete userList[socket.id];

      var sex = defineSex(profile);

      if (roomList[socket.id]) {
        var roomName = roomList[socket.id].name;
        delete roomList[socket.id][sex.sexArr][profile.getID()];
        roomList[socket.id][sex.len]--;
        delete roomList[socket.id];
        delete profiles[profile.getID()];
        if (rooms[roomName].guys_count == 0 && rooms[roomName].girls_count == 0) {
          delete rooms[roomName];
        }
      }
      cb(null, null);
    } //////////////////////////////////////////////////////////////////////////////////////
  ], function (err) {
    if (err) { new GameError(null, "EXIT", err.message)  }

    //callback(null, null);
    socket.disconnect(); // отключаемся
  }); ///////////////////////////////////////////////////////////////////////////////////////
};
