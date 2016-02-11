var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');

/*
 Получаем профиль (Нужна ли вообще такая функция, если в окне профиля только инф,
 которую можно достать из соц. сетей ????)
 - Если смотрим свой профиль - отправляем клиенту наши данные (какие ?)
 - Если чужой
 -- Получам профиль того, кого смотрим (из ОЗУ или БД)
 -- Добавляем себя ему в гости (пишем сразу в БД)
 -- Отправлем клиенту данные профиля (????)
 -- Если тот, кого смотрим, онлайн, наверно нужно его сразу уведомить о гостях ???
 */
function getProfile(socket, userList, profiles) {
    socket.on('get_profile', function(options) {

        if (!checkInput('get_profile', socket, userList, options))
            return new GameError(socket, "ADDFRIEND", "Верификация не пройдена");

        var selfProfile = userList[socket.id];

        if (selfProfile.getID() == options.id) { // Если открываем свой профиль
            var info = {
                id: selfProfile.getID(),
                vid: selfProfile.getVID(),
                status: selfProfile.getStatus(),
                points: selfProfile.getPoints(),
                money: selfProfile.getMoney()
            };

            return socket.emit('get_profile', info);
        }

        async.waterfall([///////////////////////////////////////////////////////////////////
            function (cb) { // Получаем профиль того, чей просматриваем
                var friendProfile = null;
                var friendInfo = null;
                if (profiles[options.id]) { // Если онлайн
                    friendProfile = profiles[options.id];
                    friendInfo = {
                        id: friendProfile.getID(),
                        vid: friendProfile.getVID(),
                        status: friendProfile.getStatus(),
                        points: friendProfile.getPoints()
                    };
                    cb(null, friendProfile, friendInfo);
                }
                else {                // Если нет - берем из базы
                    friendProfile = new profilejs();
                    friendProfile.build(options.id, function (err, info) {
                        if (err) {
                            return cb(err, null);
                        }

                        friendInfo = {
                            id: info.id,
                            vid: info.vid,
                            status: info.status,
                            points: info.points
                        };
                        cb(null, friendProfile, friendInfo);
                    });
                }
            },///////////////////////////////////////////////////////////////
            function (friendProfile, friendInfo, cb) { // Добавляем себя в гости
                var info = {
                    id: selfProfile.getID(),
                    vid: selfProfile.getVID(),
                    points: selfProfile.getPoints(),
                    date: options.date
                };
                friendProfile.addToGuests(info, function (err, res) {
                    if (err) {
                        return cb(err, null);
                    }

                    cb(null, friendInfo, info);
                });//////////////////////////////////////////////////////////////
            }], function (err, friendInfo, info) { // Вызывается последней. Обрабатываем ошибки
            if (err) {
                return new GameError(socket, "ADDFRIEND", err.message);
            }

            socket.emit('get_profile', friendInfo); // Отправляем инфу

            if (profiles[friendInfo.id]) { // Если тот, кого просматирваем, онлайн, сообщаем о посещении
                var friendProfile = profiles[friendInfo.id];
                var friendSocket = friendProfile.getSocket();
                friendSocket.emit('add_guest', info);
                friendSocket.emit('get_news', friendProfile.getNews());
            }
        }); // waterfall
    });
}

module.exports = getProfile;