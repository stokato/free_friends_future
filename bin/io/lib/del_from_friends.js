var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
  GameError = require('../../game_error'),              // Ошибки
  checkInput = require('../../check_input'),            // Верификация
  sanitize        = require('../../sanitizer'),
  constants  = require('../constants');

/*
 Удалить пользователя из друзей: Информация о друге (VID, или что то еще?)
 - Получаем свой профиль
 - Получаем профиль друга (из ОЗУ или БД)
 - Удаляем друг у друга из друзей (Сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) ???
 */
module.exports = function (socket, userList, profiles) {
  socket.on(constants.IO_DEL_FROM_FRIENDS, function(options) {
    if (!checkInput(constants.IO_DEL_FROM_FRIENDS, socket, userList, options)) {
      return;
    }
    //var f = constants.FIELDS;
    var selfProfile = userList[socket.id];

    options.id = sanitize(options.id);

    if (selfProfile.getID() == options.id) {
      return new GameError(socket, constants.IO_DEL_FROM_FRIENDS, "Попытка удалить из друзей себя");
    }



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
      function (friendProfile, cb) { // Удаляем первого из друзей
        friendProfile.delFromFriends(selfProfile.getID(), function (err, res) {
          if (err) { return cb(err, null); }

          cb(null, friendProfile);
        })
      },///////////////////////////////////////////////////////////////
      function (friendProfile, cb) { // Удаляем второго
        selfProfile.delFromFriends(friendProfile.getID(), function (err, res) {
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

          socket.emit(constants.IO_DEL_FROM_FRIENDS, friendInfo);

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
            friendSocket.emit(constants.IO_DEL_FROM_FRIENDS, selfInfo);
          }

          cb(null, null);
        })
      }], function (err, res) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return new GameError(socket, constants.IO_ADD_FRIEND, err.message); }
    }); // waterfall
  });
};


