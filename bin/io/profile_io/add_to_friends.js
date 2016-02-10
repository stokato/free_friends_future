var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');

/*
 Добавить пользователя в друзья: Информация о друге (VID, или что то еще?)
 - Получаем свой профиль
 - Получаем профиль друга (из ОЗУ или БД)
 - Добдавляем друг другу в друзья (Сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) ???
 */
function addToFriends(socket, userList, profiles) {
    socket.on('add_friend', function(options) {

        if (!checkInput('add_friend', socket, userList, options))
            return new GameError(socket, "ADDFRIEND", "Верификация не пройдена");

        if (userList[socket.id].getID() == options.id)
            return new GameError(socket, "ADDFRIEND", "Нельзя добавить в друзья себя");

        var selfProfile = userList[socket.id];
        var selfInfo = {
            id: selfProfile.getID(),
            vid: selfProfile.getVID(),
            date: options.date
        };
        async.waterfall([///////////////////////////////////////////////////////////////////
            function (cb) { // Получаем профиль друга
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
            },///////////////////////////////////////////////////////////////
            function (friendProfile, cb) { // Добавляем первого в друзья
                friendProfile.addToFriends(selfInfo, function (err, res) {
                    if (err) {
                        return cb(err, null);
                    }

                    if (profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
                        var friendSocket = friendProfile.getSocket();
                        friendSocket.emit('add_friend', selfInfo);
                        friendSocket.emit('get_news', friendProfile.getNews());
                    }

                    cb(null, friendProfile);
                })
            },
            function (friendProfile, cb) { // Добавляем второго
                var friendInfo = {
                    id: friendProfile.getID(),
                    vid: friendProfile.getVID(),
                    points: friendProfile.getPoints(),
                    date: options.date
                };
                selfProfile.addToFriends(friendInfo, function (err, res) {
                    if (err) {
                        return cb(err, null);
                    }

                    socket.emit('add_friend', friendInfo);

                    cb(null, null);
                })
            }], function (err, res) { // Вызывается последней. Обрабатываем ошибки
            if (err) {
                return new GameError(socket, "ADDFRIEND", err.message);
            }
        }); // waterfall
    });
}

module.exports = addToFriends;