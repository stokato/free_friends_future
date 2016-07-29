var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),              // Ошибки
    checkInput = require('../../check_input'),            // Верификация
    sanitize        = require('../../sanitizer'),
    constants  = require('../constants');

/*
 Добавить пользователя в друзья: Информация о друге (VID, или что то еще?)
 - Получаем свой профиль
 - Получаем профиль друга (из ОЗУ или БД)
 - Добдавляем друг другу в друзья (Сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) ???
 */
module.exports = function (socket, userList, profiles) {
  socket.on(constants.IO_ADD_FRIEND, function(options) {
    if (!checkInput(constants.IO_ADD_FRIEND, socket, userList, options)) {
      return;
    }
    //var f = constants.FIELDS;
    var selfProfile = userList[socket.id];

    if (selfProfile.getID() == options.id) {
      return new GameError(socket, constants.IO_ADD_FRIEND, "Попытка добавить в друзья себя");
    }

    options.id = sanitize(options.id);

    var date = new Date();

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль друга
        var friendProfile = null;
        if (profiles[options.id]) {      // Если онлайн
          friendProfile = profiles[options.id];
          cb(null, friendProfile);
        }
        else {                           // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (friendProfile, cb) { // Добавляем первого в друзья
        var user = {};
        user.friendid = selfProfile.getID();
        user.friendvid = selfProfile.getVID();
        user.date = date;

        friendProfile.addToFriends(user, function (err, res) {
          if (err) { return cb(err, null); }

          cb(null, friendProfile);
        })
      },///////////////////////////////////////////////////////////////
      function (friendProfile, cb) { // Добавляем второго

        var user = {};
        user.friendid = friendProfile.getID();
        user.friendvid = friendProfile.getVID();
        user.date= date;

        selfProfile.addToFriends(user, function (err, res) {
          if (err) { return cb(err, null); }

          var friendInfo = {};
          friendInfo.id      = friendProfile.getID();
          friendInfo.vid     = friendProfile.getVID();
          friendInfo.date    = date;
          friendInfo.points  = friendProfile.getPoints();
          friendInfo.age     = friendProfile.getAge();
          friendInfo.city    = friendProfile.getCity();
          friendInfo.country = friendProfile.getCountry();
          friendInfo.sex     = friendProfile.getSex();

          socket.emit(constants.IO_ADD_FRIEND, friendInfo);

          if (profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
            var selfInfo = {};
            selfInfo.id      = selfProfile.getID();
            selfInfo.vid     = selfProfile.getVID();
            selfInfo.date    = date;
            selfInfo.points  = selfProfile.getPoints();
            selfInfo.age     = selfProfile.getAge();
            selfInfo.city    = selfProfile.getCity();
            selfInfo.country = selfProfile.getCountry();
            selfInfo.sex     = selfProfile.getSex();

            var friendSocket = friendProfile.getSocket();
            friendSocket.emit(constants.IO_ADD_FRIEND, selfInfo);

            friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
          }

          cb(null, null);
        })
      }], function (err, res) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return new GameError(socket, constants.IO_ADD_FRIEND, err.message); }
    }); // waterfall
  });
};


