var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');
/*
 Отправить личное сообщение: Сообщение, объект с инф. о получателе (VID, еще что то?)
 - Получаем свой профиль
 - Получаем профиль адресата (из ОЗУ или БД)
 - Сохраняем адресату сообщение
 - Сохраняем сообщение себе                                       ???
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
function sendPrivateMessage(socket, userList, profiles) {
    socket.on('private_message', function(options) {

        if (!checkInput('private_message', socket, userList, options))
            return new GameError(socket, "SENDPRIVMESSAGE", "Верификация не пройдена");

        if (userList[socket.id].getID() == options.id)
            return new GameError(socket, "SENDPRIVMESSAGE", "Нельзя отправлять сообщения себе");

        var selfProfile = userList[socket.id];
        async.waterfall([//////////////////////////////////////////////////////////////
            function (cb) { // Получаем данные адресата и готовим сообщение к добавлению в историю
                var friendProfile = null;
                if (profiles[options.id]) { // Если онлайн
                    friendProfile = profiles[options.id];
                    cb(null, friendProfile);
                }
                else {                // Если нет - берем из базы
                    friendProfile = new profilejs();
                    friendProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
                        if (err) {
                            return cb(err, null);
                        }

                        cb(null, friendProfile);
                    });
                }
            }, ///////////////////////////////////////////////////////////////////////////////
            function (friendProfile, cb) { // Сохраняем сообщение в историю получателя
                var savingMessage = {
                    date: options.date,
                    companionid: selfProfile.getID(),
                    companionvid: selfProfile.getVID(),
                    incoming: true,
                    text: options.text,
                    opened: false
                };
                friendProfile.addMessage(savingMessage, function (err, result) {
                    if (err) {
                        return cb(err, null);
                    }

                    if (profiles[options.id]) {
                        savingMessage['vid'] = selfProfile.getVID();
                        var friendSocket = profiles[options.id].getSocket();
                        friendSocket.emit('private_message', savingMessage);
                        friendSocket.emit('get_news', friendProfile.getNews());
                    }
                    cb(null, savingMessage, friendProfile);
                });
            }, //////////////////////////////////////////////////////////////////////////////////////
            function (savingMessage, friendProfile, cb) { // Сохраняем сообщение в историю отправителя
                savingMessage = {
                    date: options.date,
                    companionid: friendProfile.getID(),
                    companionvid: friendProfile.getVID(),
                    incoming: false,
                    text: options.text,
                    opened: true
                };
                selfProfile.addMessage(savingMessage, function (err, res) {
                    if (err) {
                        cb(err, null);
                    }

                    savingMessage['vid'] = friendProfile.getVID();
                    socket.emit('private_message', savingMessage);
                    cb(null, null);
                });
            }/////////////////////////////////////////////////////////////////////////////////
        ], function (err) { // Вызывается последней или в случае ошибки
            if (err) {
                new GameError(socket, "SENDPRIVMESSAGE", err.message);
            }
        });
    });
}

module.exports = sendPrivateMessage;