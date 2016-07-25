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
    var f = constants.FIELDS;
    var selfProfile = userList[socket.id];

    if (selfProfile.getID() == options[f.id]) {
      return new GameError(socket, constants.IO_ADD_FRIEND, "Попытка добавить в друзья себя");
    }

    options[f.id] = sanitize(options[f.id]);

    var date = new Date();

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль друга
        var friendProfile = null;
        if (profiles[options[f.id]]) {      // Если онлайн
          friendProfile = profiles[options[f.id]];
          cb(null, friendProfile);
        }
        else {                           // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options[f.id], function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (friendProfile, cb) { // Добавляем первого в друзья
        var user = {};
        user[f.friendid] = selfProfile.getID();
        user[f.friendvid] = selfProfile.getVID();
        user[f.date]= date;

        friendProfile.addToFriends(user, function (err, res) {
          if (err) { return cb(err, null); }

          cb(null, friendProfile);
        })
      },///////////////////////////////////////////////////////////////
      function (friendProfile, cb) { // Добавляем второго

        var user = {};
        user[f.friendid] = friendProfile.getID();
        user[f.friendvid] = friendProfile.getVID();
        user[f.date]= date;

        selfProfile.addToFriends(user, function (err, res) {
          if (err) { return cb(err, null); }

          var friendInfo = {};
          friendInfo[f.id]      = friendProfile.getID();
          friendInfo[f.vid]     = friendProfile.getVID();
          friendInfo[f.date]    = date;
          friendInfo[f.points]  = friendProfile.getPoints();
          friendInfo[f.age]     = friendProfile.getAge();
          friendInfo[f.city]    = friendProfile.getCity();
          friendInfo[f.country] = friendProfile.getCountry();
          friendInfo[f.sex]     = friendProfile.getSex();

          socket.emit(constants.IO_ADD_FRIEND, friendInfo);

          if (profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
            var selfInfo = {};
            selfInfo[f.id]      = selfProfile.getID();
            selfInfo[f.vid]     = selfProfile.getVID();
            selfInfo[f.date]    = date;
            selfInfo[f.points]  = selfProfile.getPoints();
            selfInfo[f.age]     = selfProfile.getAge();
            selfInfo[f.city]    = selfProfile.getCity();
            selfInfo[f.country] = selfProfile.getCountry();
            selfInfo[f.sex]     = selfProfile.getSex();

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


