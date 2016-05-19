var async     =  require('async');
// Свои модули
var addEmits  =  require('./add_emits');
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    autoPlace = require('./auto_place_in_room'),
    getRoomInfo = require('./get_room_info'),
    getLastMessages = require('./get_last_messages'),
    genDateHistory = require('./gen_date_history'),
    constants = require('./../constants');

/*
 Выполняем инициализацию
 - Создаем профиль
 - Добавляем его в массив онлайн профилей
 - Помещаем в комнату
 - Получаем данные профиля (какие именно в этот момент нужны???)
 - Получаем данные профилей игроков в комнате (для игрового стола)
 - Отправляем все клиенту
 */
module.exports = function (socket, userList, profiles, roomList, rooms) {
  socket.on(constants.IO_INIT, function(options) {
    if (!checkInput(constants.IO_INIT, socket, userList, options)) { return ; }
    var f = constants.FIELDS;

    async.waterfall([///////////////////////////////////////////////////////////
      function (cb) { // Инициализируем профиль пользователя
        var selfProfile = new profilejs();
        var newConnect = false;
        selfProfile.init(socket, options, function (err, info) {
          if (err) { return cb(err, null); }

          var oldProfile = profiles[info[f.id]];
          if (oldProfile)  {
            oldProfile.clearExitTimeout();

            var oldSocket = oldProfile.getSocket();
            oldProfile.setSocket(socket);

            delete userList[oldSocket.id];
            userList[socket.id] =  oldProfile;

            var room = roomList[oldSocket.id];
            delete  roomList[oldSocket.id];
            roomList[socket.id] = room;
          }
          else {
            userList[socket.id] = selfProfile;
            profiles[selfProfile.getID()] = selfProfile;

            newConnect = true;
          }

          cb(null, info, newConnect, selfProfile);
        });
      }, ///////////////////////////////////////////////////////////////
      function (info, newConnect, selfProfile, cb) { // Помещяем в комнату
        if(newConnect) {
          autoPlace(socket, userList, roomList, rooms, function (err, room) {
            if (err) { return cb(err, null); }

            //selfProfile.setReady(true);

           // room.game.start(socket);

            cb(null, info, room);
          });
        } else {
          var room = roomList[socket.id];
          info[f.game] = room.game.getGameState(); // Получаем состояние игры в комнате
          socket.join(room.name);

          cb(null, info, room);
        }
      },///////////////////////////////////////////////////////////////
      function (info, room, cb) { // Получаем данные по игрокам в комнате (для стола)
        getRoomInfo(room, function (err, roomInfo) {
          if (err) { return cb(err, null); }

          info[f.room] = roomInfo;

          socket.broadcast.in(room.name).emit(constants.IO_ROOM_USERS, roomInfo);

          room.game.start(socket);

          cb(null, info, room);
        });
      },///////////////////////////////////////////////////////////////
      function(info, room, cb) {

        socket.emit(constants.IO_INIT, info);

        var online = {};
        online[f.id] = info[f.id];
        online[f.vid] = info[f.vid];
        socket.broadcast.emit(constants.IO_ONLINE, online);

        getLastMessages(socket, room);

        cb(null, info, room);
      }, //////////////////////////////////////////////////////////////////
      function (info, room, cb) { // Получаем данные по приватным чатам
        var secondDate = new Date();
        var firstDate = genDateHistory(secondDate);

        var period = {};
        period[f.first_date] = firstDate;
        period[f.second_date] = secondDate;
        userList[socket.id].getPrivateChatsWithHistory(period, function(err, history) {
          if(err) { return cb(err, null) }

          history = history || [];
          history.sort(compareDates);

          var i;
          for(i = 0; i < history.length; i++) {
            socket.emit(constants.IO_MESSAGE, history[i]);
          }

          cb(null, null);
        });
      }, ////////////////////////////////////////////////////////////
      function(res, cb) { // добавляем слушатели
        addEmits(socket, userList, profiles, roomList, rooms);
        cb(null, null);
      }///////////////////////////////////////////////////////////////
    ], function (err, res) { // Обрабатываем ошибки, либо передаем данные клиенту
      if (err) { return new GameError(socket, constants.IO_INIT, err.message); }
    });
  })
};

// Для сортировки массива сообщений (получение топа по дате)
function compareDates(mesA, mesB) {
  var f = constants.FIELDS;
  return mesA[f.date] - mesB[f.date];
}


