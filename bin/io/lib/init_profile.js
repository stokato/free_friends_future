var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    autoPlace = require('./auto_place_in_room'),
    getRoomInfo = require('./get_room_info'),
    getLastMessages = require('./get_last_messages'),
    genDateHistory = require('./gen_date_history');

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
  socket.on('init', function(options) {
    if (!checkInput('init', socket, userList, options)) {
      return new GameError(socket, "INIT", "Верификация не пройдена");
    }

    async.waterfall([///////////////////////////////////////////////////////////
      function (cb) { // Инициализируем профиль пользователя
        var profile = new profilejs();
        var newConnect = false;
        profile.init(socket, options, function (err, info) {
          if (err) { return cb(err, null); }

          var oldProfile = profiles[info.id];
          if (oldProfile)  {
            //cb(new Error("Этот пользователь уже инициализирован"), null);
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
            userList[socket.id] = profile;
            profiles[info.id] = profile;

            newConnect = true;
          }

          cb(null, info, newConnect);
        });
      }, ///////////////////////////////////////////////////////////////
      function (info, newConnect, cb) { // Помещяем в комнату
        if(newConnect) {
          autoPlace(socket, userList, roomList, rooms, function (err, room) {
            if (err) { return cb(err, null); }

            cb(null, info, room);
          });
        } else {
          var room = roomList[socket.id];

          cb(null, info, room);
        }
      },///////////////////////////////////////////////////////////////
      function (info, room, cb) { // Получаем данные по игрокам в комнате (для стола)
        getRoomInfo(room, function (err, roomInfo) {
          if (err) { return cb(err, null); }

          info['room'] = roomInfo;

          cb(null, info, room);
        });
      },///////////////////////////////////////////////////////////////
      function(info, room, cb) {
        socket.emit('init', info);
        socket.broadcast.emit('online', {id: info.id, vid: info.vid});

        getLastMessages(socket, room);

        cb(null, info, room);
      },
      function (info, room, cb) { // Получаем данные по приватным чатам
        var firstDate = genDateHistory(new Date());
        userList[socket.id].getPrivateChats(firstDate, function(err, history) {
          if(err) { return cb(err, null) }

          history = history || [];
          history.sort(compareDates);

          for(var i = 0; i < history.length; i++) {
            socket.emit('message', history[i]);
          }

          cb(null, null);
        });
      }///////////////////////////////////////////////////////////////
    ], function (err, res) { // Обрабатываем ошибки, либо передаем данные клиенту
      if (err) { return new GameError(socket, "INIT", err.message); }

    });
  })
};

// Для сортировки массива сообщений (получение топа по дате)
function compareDates(mesA, mesB) {
  return mesA.date - mesB.date;
}


