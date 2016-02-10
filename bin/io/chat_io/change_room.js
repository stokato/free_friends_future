// Свои модули
var GameError = require('../../game_error'),
    checkInput = require('../../check_input');
var constats = require('./../constants_io');
var createRoom = require('./create_room');
var getLastMessages = require('./get_last_messages');
var getRoomInfo = require('./get_room_info');
/*
 Сменить комнату: Идентификатор новой комнаты
 - Получаем свой профиль
 - Узнаем пол
 - Если создаем комнату (клиент может создавать комнаты ?)
 -- Созадем новый объект комнаты и геним ему идентификатор
 - Если выбираем из имеющихся
 -- Отправляем клиенту последние сообщения комнаты (сколько ???)
 - Отвязываеся от старой комнаты
 - Связываемся с новой
 - Получаем данные профиля (какие ???)
 - Добавляем к ним данные игроков (девушки и парни на игровом столе)
 - Отправляем клиенту
 */
function changeRoom(socket, userList, rooms, roomList) {
    socket.on('change_room', function(options) {
        if (!checkInput('change_room', socket, userList, options))
            return new GameError(socket, "CHANGEROOM", "Верификация не пройдена");

        if(!rooms[options.room] && options.room != "new_room")
            return new GameError(socket, "CHANGEROOM", "Некорректный идентификатор комнаты");

        if(roomList[socket.id].name == options.room)
            return new GameError(socket, "CHANGEROOM", "Пользователь уже находится в этой комнате");

        var newRoom = null;
        var currRoom = roomList[socket.id];
        var profile = userList[socket.id];
        var len = '';
        var genArr = '';
        if (profile.getGender() == constats.GUY) {
            len = 'guys_count';
            genArr = 'guys';
        }
        else {
            len = 'girls_count';
            genArr = 'girls';
        }

        if (options.room == "new_room") {
            newRoom = createRoom(socket);
            rooms[newRoom.name] = newRoom;
        } else {
            var item;
            for (item in rooms) if (rooms.hasOwnProperty(item)) {
                if (rooms[item].name == options.room) {
                    if (rooms[item][len] >= constats.ONE_GENDER_IN_ROOM) {
                        return new GameError(socket, "CHANGEROOM", "Попытка открыть комнату в которой нет места");
                    }
                    newRoom = rooms[item];

                    getLastMessages(socket, rooms[item]);
                }
            }
        }
        if (!newRoom) {
            return new GameError(socket, "CHANGEROOM", "Попытка открыть несуществующую комнату")
        }

        socket.leave(currRoom.name);
        socket.join(newRoom.name);

        newRoom[genArr][profile.getID()] = profile;
        newRoom[len]++;

        roomList[socket.id] = newRoom;

        delete currRoom[genArr][profile.getID()];
        currRoom[len]--;
        if (currRoom.guys_count == 0 && currRoom.girls_count == 0) delete rooms[currRoom.name];


        getRoomInfo(newRoom, function (err, info) {
            if (err) {
                return new GameError(socket, "CHANGEROOM", err.message);
            }

            socket.emit('open_room', info);
        });
    });
}

module.exports = changeRoom;