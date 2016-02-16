var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');
var autoPlace = require('./auto_place_in_room');
var getRoomInfo = require('./get_room_info');
var getLastMessages = require('./get_last_messages');

/*
 Выполняем инициализацию
 - Создаем профиль
 - Добавляем его в массив онлайн профилей
 - Помещаем в комнату
 - Получаем данные профиля (какие именно в этот момент нужны???)
 - Получаем данные профилей игроков в комнате (для игрового стола)
 - Отправляем все клиенту
 */
function initProfile(socket, userList, profiles, roomList, rooms) {
    socket.on('init', function(options) {
        if (!checkInput('init', socket, userList, options))
            return new GameError(socket, "INIT", "Верификация не пройдена");


        async.waterfall([ // Инициализируем профиль пользователя
            function (cb) {
                var profile = new profilejs();
                var newConnect = false;
                profile.init(socket, options, function (err, info) {
                    if (err) {
                        return cb(err, null);
                    }

                    if (profiles[info.id])  {
                        //cb(new Error("Этот пользователь уже инициализирован"), null);
                        profiles[info.id].clearExitTimeout();
                        var oldSocket = profiles[info.id].getSocket();
                        profiles[info.id].setSocket(socket);
                        delete userList[oldSocket.id];
                        userList[socket.id] =  profiles[info.id];
                        var room = roomList[oldSocket.id];
                        delete  roomList[oldSocket.id];
                        roomList[socket.id] = room;
                    }
                    else {
                        userList[socket.id] = profile;
                        profiles[info.id] = profile;

                        newConnect = true;
                    }

                    cb(null, info, newConnect);
                });
            }, ///////////////////////////////////////////////////////////////
            function (info, newConnect, cb) { // Помещяем в комнату
                if(newConnect) {
                    autoPlace(socket,  userList, roomList, rooms, function (err, room) {
                        if (err) {
                            return cb(err, null);
                        }

                        cb(null, info, room);
                    });
                } else {
                    var room = roomList[socket.id];

                    cb(null, info, room);
                }
            },///////////////////////////////////////////////////////////////
            function (info, room, cb) { // Получаем данные по игрокам в комнате (для стола)
                getRoomInfo(room, function (err, roomInfo) {
                    if (err) {
                        return cb(err, null);
                    }
                    info['room'] = roomInfo;

                    cb(null, info, room);
                });
            },///////////////////////////////////////////////////////////////
            function (info, room, cb) { // Получаем данные по приватным чатам
                userList[socket.id].getPrivateChats(null, null, function(err, chats) {
                   if(err) { return cb(err, null) }

                    info.chats = chats;
                    cb(null, info, room);
                });
            }///////////////////////////////////////////////////////////////
        ], function (err, info, room) { // Обрабатываем ошибки, либо передаем данные клиенту
            if (err) {
                return new GameError(socket, "INIT", err.message);
            }
            socket.emit('init', info);
            socket.broadcast.emit('online', {id: info.id, vid: info.vid});

            getLastMessages(socket, room);
        });
    })
}

module.exports = initProfile;