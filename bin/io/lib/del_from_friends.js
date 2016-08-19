var async     =  require('async');
// Свои модули
var profilejs = require('../../profile/index'),          // Профиль
  GameError   = require('../../game_error'),              // Ошибки
  checkInput  = require('../../check_input'),            // Верификация
  //sanitize    = require('../../sanitizer'),
  constants   = require('../../constants');

var oPool = require('./../../objects_pool');

/*
 Удалить пользователя из друзей: Информация о друге (VID, или что то еще?)
 - Получаем свой профиль
 - Получаем профиль друга (из ОЗУ или БД)
 - Удаляем друг у друга из друзей (Сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) ???
 */
module.exports = function (socket) {
  socket.on(constants.IO_DEL_FROM_FRIENDS, function(options) {
    if (!checkInput(constants.IO_DEL_FROM_FRIENDS, socket, oPool.userList, options)) { return; }

    var selfProfile = oPool.userList[socket.id];

    //options.id = sanitize(options.id);

    if (selfProfile.getID() == options.id) {
      return handError(constants.errors.SELF_ILLEGAL);
    }

    var date = new Date();

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль друга

        var friendProfile = null;
        if (oPool.profiles[options.id]) {         // Если онлайн

          friendProfile = oPool.profiles[options.id];
          cb(null, friendProfile);

        } else {                            // Если нет - берем из базы

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

          //var friendInfo = fillInfo(friendProfile, date);
          //friendInfo.operation_status = constants.RS_GOODSTATUS;
          //
          //socket.emit(constants.IO_DEL_FROM_FRIENDS, friendInfo);
          //
          //if (oPool.profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
          //  var selfInfo = fillInfo(selfProfile, date);
          //  var friendSocket = friendProfile.getSocket();
          //
          //  friendSocket.emit(constants.IO_NO_FRIEND, selfInfo);
          //}

          cb(null, friendProfile);
        })

      }], function (err, friendProfile) { // Вызывается последней. Обрабатываем ошибки
        if (err) { return handError(options, err.message); }

        var friendInfo = fillInfo(friendProfile, date);
        friendInfo.operation_status = constants.RS_GOODSTATUS;

        socket.emit(constants.IO_DEL_FROM_FRIENDS, friendInfo);

        if (oPool.profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
          var selfInfo = fillInfo(selfProfile, date);
          var friendSocket = friendProfile.getSocket();

          friendSocket.emit(constants.IO_NO_FRIEND, selfInfo);
        }
    }); // waterfall


    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_DEL_FROM_FRIENDS, res);

      new GameError(socket, constants.IO_DEL_FROM_FRIENDS, err.message || constants.errors.OTHER.message);
    }


    function fillInfo(profile, date) {
      var info = {};
      info.id      = profile.getID();
      info.vid     = profile.getVID();
      info.date    = date;
      info.points  = profile.getPoints();
      info.age     = profile.getAge();
      info.city    = profile.getCity();
      info.country = profile.getCountry();
      info.sex     = profile.getSex();

      return info;
    }
  });
};


