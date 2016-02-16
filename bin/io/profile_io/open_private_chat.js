var async = require('async');
var GameError = require('../../game_error'),
    checkInput = require('../../check_input');

module.exports = function(socket, userList, profiles) {
    socket.on('open_private_chat', function(options) {
        if (!checkInput('open_private_chat', socket, userList, options))
            return new GameError(socket, "OPENPRIVCHAT", "Верификация не пройдена");

        if(!profiles[options.id]) {
            return new GameError(socket, "OPENPRIVCHAT", "Этот пользователь offline");
        }

        async.waterfall([
            function(cb) { ////////////////////// Отрываем чат для одного и отрпавляем ему историю
                var compProfile = profiles[options.id];
                var selfProfile = userList[socket.id];

                if(selfProfile.getID() == options.id) {
                    return cb(new Error("Попытка открыть чат с самим сабой"))
                }

                var chat = { id : compProfile.getID(), vid : compProfile.getVID() };
                selfProfile.addPrivateChat(chat, function(err, chatInfo) {
                    if(err) { return cb(err, null); }

                    socket.emit('open_private_chat', chatInfo);

                    cb(null, selfProfile, compProfile);
                });

            },  ///////////////////////////////// Открываем чат второму и тоже отправляем историю
            function(selfProfile, compProfile, cb) {
                var chat = { id : selfProfile.getID(), vid : selfProfile.getVID() };
                compProfile.addPrivateChat(chat, function (err, chatInfo) {
                    if (err) { cb(err, null); }

                    var compSocket = compProfile.getSocket();
                    compSocket.emit('open_private_chat', chatInfo);
                    cb(null, null);
                });
        }
        ], function(err, res) {
            if (err) {
                return new GameError(socket, "OPENPRIVCHAT", err.message);
            }


        });

    });
};