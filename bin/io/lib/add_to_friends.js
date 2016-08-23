var async     =  require('async');
// Свои модули
var constants  = require('../../constants'),
    profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),              // Ошибки
    checkInput = require('../../check_input');            // Верификация


var oPool = require('./../../objects_pool');

/*
 Добавить пользователя в друзья: Информация о друге (VID)
 - Получаем свой профиль
 - Получаем профиль друга (из ОЗУ или БД)
 - Добдавляем друг другу в друзья (Сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн)
 */
module.exports = function (socket) {
  socket.on(constants.IO_ADD_FRIEND, function(options) {
    if (!checkInput(constants.IO_ADD_FRIEND, socket, options)) {  return; }

    var selfProfile = oPool.userList[socket.id];

    if (selfProfile.getID() == options.id) {
      return handError(constants.errors.SELF_ILLEGAL);
    }

    //options.id = sanitize(options.id);

    var date = new Date();

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль друга

        var friendProfile = null;
        if (oPool.profiles[options.id]) {        // Если онлайн

          friendProfile = oPool.profiles[options.id];

          cb(null, friendProfile);
        } else {                           // Если нет - берем из базы

          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });

        }

      },///////////////////////////////////////////////////////////////
      function (friendProfile, cb) { // Добавляем первого в друзья

        var user = {};
        user.friendid  = selfProfile.getID();
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

          //var friendInfo = fillInfo(friendProfile, date);
          //
          //friendInfo.operation_status = constants.RS_GOODSTATUS;
          //socket.emit(constants.IO_ADD_FRIEND, friendInfo);
          //
          //if (oPool.profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
          //  var selfInfo = fillInfo(selfProfile, date);
          //
          //  var friendSocket = friendProfile.getSocket();
          //  friendSocket.emit(constants.IO_NEW_FRIEND, selfInfo);
          //
          //  friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
          //}

          cb(null, friendProfile);
        })
      }], function (err, friendProfile) { // Вызывается последней. Обрабатываем ошибки
      if (err) {
        return handError(err);
      }

      var friendInfo = fillInfo(friendProfile, date);

      friendInfo.operation_status = constants.RS_GOODSTATUS;
      socket.emit(constants.IO_ADD_FRIEND, friendInfo);

      if (oPool.profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
        var selfInfo = fillInfo(selfProfile, date);

        var friendSocket = friendProfile.getSocket();
        friendSocket.emit(constants.IO_NEW_FRIEND, selfInfo);

        friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
      }
    }); // waterfall

    //--------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_ADD_FRIEND, res);

      new GameError(socket, constants.IO_ADD_FRIEND, err.message || constants.errors.OTHER.message);
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




