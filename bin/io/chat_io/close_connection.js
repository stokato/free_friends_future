var async     =  require('async');
var GameError = require('../../game_error'),
    checkInput = require('../../check_input');

var constants = require('./../constants_io');

module.exports = function(socket, userList, profiles, roomList, rooms) {
    if (!checkInput('exit', socket, userList, null))
        return new GameError(socket, "EXIT", "Верификация не пройдена");

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
                if (err) {
                    return cb(err, null);
                }

                cb(null, null);
            });
        }, /////////////////////////////////////////////////////////////////////////////////////
        function (res, cb) { // удалеяем профиль и сокет из памяти
            delete userList[socket.id];

            var len = '';
            var genArr = '';
            if (profile.getSex() == constants.GUY) {
                len = 'guys_count';
                genArr = 'guys';
            }
            else {
                len = 'girls_count';
                genArr = 'girls';
            }

            var roomName = roomList[socket.id].name;
            delete roomList[socket.id][genArr][profile.getID()];
            roomList[socket.id][len]--;
            delete roomList[socket.id];
            delete profiles[profile.getID()];
            if(rooms[roomName].guys_count == 0 && rooms[roomName].girls_count == 0)
                delete roomName[roomName];

            cb(null, null);
        } //////////////////////////////////////////////////////////////////////////////////////
    ], function (err) {
        if (err) {
            new GameError(null, "EXIT", err.message)
        }

        //callback(null, null);
        socket.disconnect(); // отключаемся
    }); ///////////////////////////////////////////////////////////////////////////////////////
};