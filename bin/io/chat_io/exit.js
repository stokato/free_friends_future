var async     =  require('async');
var GameError = require('../../game_error'),
    checkInput = require('../../check_input');

var constants = require('./../constants_io');

/*
 Выходим (отключаемся)
 - получаем свой профиль и комнату
 - сообщаем все в комнате об уходе
 - сохраняем профиль в БД
 - удаляем профиль и комнату из памяти
 - отключаем сокет
 */
function exit(socket, userList, profiles, roomList) {
    socket.on('exit', function() {
        if (!checkInput('exit', socket, userList, null))
            return new GameError(socket, "EXIT", "Верификация не пройдена");

        var profile = userList[socket.id];
        async.waterfall([
            ///////////////////////////////////////////////////////////////////////////////////
            function (cb) { // получаем данные пользователя и сообщаем всем, что он ушел
                var info = {id: profile.getID(), vid: profile.getVID()};

                socket.broadcast.to().emit('offline', info);

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
                if (profile.getGender() == constants.GUY) {
                    len = 'guys_count';
                    genArr = 'guys';
                }
                else {
                    len = 'girls_count';
                    genArr = 'girls';
                }

                delete roomList[socket.id][genArr][profile.getID()];
                roomList[socket.id][len]--;
                delete roomList[socket.id];
                delete profiles[profile.getID()];

                cb(null, null);
            } //////////////////////////////////////////////////////////////////////////////////////
        ], function (err) {
            if (err) {
                new GameError(null, "EXIT", err.message)
            }

            socket.disconnect(); // отключаемся
        }); ///////////////////////////////////////////////////////////////////////////////////////
    });
} // Выходим из чата

module.exports = exit;