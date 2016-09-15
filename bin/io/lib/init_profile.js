var async     =  require('async');

// Свои модули
var constants       = require('./../../constants'),
    profilejs       =  require('../../profile/index'),          // Профиль
    GameError       = require('../../game_error'),
    checkInput      = require('../../check_input'),
    autoPlace       = require('./auto_place_in_room'),
    getRoomInfo     = require('./get_room_info'),
    getLastMessages = require('./get_last_messages'),
    genDateHistory  = require('./gen_date_history'),
    sendUsersInRoom = require('./send_users_in_room'),
    setGiftTimeout = require('./set_gift_timeout'),
    addEmits        =  require('./add_emits');

var oPool = require('./../../objects_pool');

/*
 Выполняем инициализацию
 - Создаем профиль
 - Добавляем его в массив онлайн профилей
 - Помещаем в комнату
 - Получаем данные профиля (какие именно в этот момент нужны???)
 - Получаем данные профилей игроков в комнате (для игрового стола)
 - Отправляем все клиенту
 */
module.exports = function (socket) {
  socket.on(constants.IO_INIT, function(options) {
    if (!checkInput(constants.IO_INIT, socket, options)) { return ; }

    async.waterfall([///////////////////////////////////////////////////////////
      function(cb) { // Сохраняем в сессию признак пройденной авторизации
        socket.handshake.session.authorized = true;
        socket.handshake.sessionStore.set(socket.handshake.sessionID, socket.handshake.session, function(err) {
          if(err) {cb (err, null); }

          cb(null, null);
        })
      }, ///////////////////////////////////////////////////////////
      function (res, cb) { // Инициализируем профиль пользователя

        var selfProfile = new profilejs();
        var newConnect = false;
        selfProfile.init(socket, options, function (err, info) {
          if (err) { return cb(err, null); }

          // Если присутствует старый профиль этого пользователя, меняем его на новый
          var oldProfile = oPool.profiles[info.id];
          if (oldProfile)  {
            oldProfile.clearExitTimeout();

            var oldSocket = oldProfile.getSocket();
            oldProfile.setSocket(socket);

            delete oPool.userList[oldSocket.id];
            oPool.userList[socket.id] =  oldProfile;

            var room = oPool.roomList[oldSocket.id];
            delete  oPool.roomList[oldSocket.id];
            oPool.roomList[socket.id] = room;
          }
                  // либо сохраняем новый
          else {
            oPool.userList[socket.id] = selfProfile;
            oPool.profiles[selfProfile.getID()] = selfProfile;

            newConnect = true;
          }

          cb(null, info, newConnect, selfProfile);
        });
      }, ///////////////////////////////////////////////////////////////
      function (info, newConnect, selfProfile, cb) { // Помещяем в комнату
        if(newConnect) {
          autoPlace(socket, function (err, room) {
            if (err) { return cb(err, null); }

            cb(null, info, room, selfProfile);
          });
        } else {
          var room = oPool.roomList[socket.id];
          info.game = room.game.getGameState(); // Получаем состояние игры в комнате
          socket.join(room.name);

          cb(null, info, room, selfProfile);
        }
      },///////////////////////////////////////////////////////////////
      function (info, room, selfProfile, cb) { // Получаем данные по игрокам в комнате (для стола)
        getRoomInfo(room, function (err, roomInfo) {
          if (err) { return cb(err, null); }

          info.room = roomInfo;

          if(info.gift1) {
            var currDate = new Date();
            var giftDate = new Date(info.gift1.date);
            if(currDate >= giftDate) {
              selfProfile.clearGiftInfo(function() {
                info.gift1 = null;

                cb(null, info, room, roomInfo);
              });
            } else {
              cb(null, info, room, roomInfo);
            }
          } else {
            cb(null, info, room, roomInfo);
          }
        });
      },///////////////////////////////////////////////////////////////
      function(info, room, roomInfo, cb) {
        //socket.broadcast.in(room.name).emit(constants.IO_ROOM_USERS, roomInfo);
        sendUsersInRoom(roomInfo, info.id, function(err, roomInfo) {
          if(err) { return cb(err); }

          info.room = roomInfo;

          room.game.start(socket);

          cb(null, info, room);
        });
      },//////////////////////////////////////////////////////////////
      function(info, room, cb) {  // Уведомляем всех о входе пользователя

        var online = {
          id        : info.id,
          vid       : info.vid
        };

        for(var r in oPool.rooms) if(oPool.rooms.hasOwnProperty(r)) {
          socket.broadcast.in(room.name).emit(constants.IO_ONLINE, online);
        }
        //socket.broadcast.emit(constants.IO_ONLINE, online);

        info.operation_status = constants.errors.RS_GOODSTATUS;
        socket.emit(constants.IO_INIT, info);

        getLastMessages(socket, room);

        cb(null, info, room);
      }, //////////////////////////////////////////////////////////////////
      function(info, room, cb) { // Запускаем трек
        if(room.track_list.length > 0) {
          var passedTime = Math.round((new Date() - room.trackTime) * 0.001);
          var trackInfo = { track : room.track_list[0], passed_time : passedTime };
          socket.emit(constants.IO_START_TRACK, trackInfo);
        }
        cb(null, info, room);
      }, //////////////////////////////////////////////////////////////////
      function (info, room, cb) { // Получаем данные по приватным чатам
        var secondDate = new Date();
        var firstDate = genDateHistory(secondDate);

        var period = {};
        period.first_date = firstDate;
        period.second_date = secondDate;
        oPool.userList[socket.id].getPrivateChatsWithHistory(period, function(err, history) {
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

        addEmits(socket);

        cb(null, null);
      }///////////////////////////////////////////////////////////////
    ], function (err, res) { // Обрабатываем ошибки, либо передаем данные клиенту
      if (err) { return handError(err); }

    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_INIT, res);

      new GameError(socket, constants.IO_INIT, err.message || constants.errors.OTHER.message);
    }

    // Для сортировки массива сообщений (получение топа по дате)
    function compareDates(mesA, mesB) {
      //var f = constants.FIELDS;
      return mesA.date - mesB.date;
    }
  })
};




