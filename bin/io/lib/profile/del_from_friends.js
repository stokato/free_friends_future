var async     =  require('async');

// Свои модули
var constants   = require('./../../../constants'),
  getUserProfile = require('./../common/get_user_profile');

var oPool = require('./../../../objects_pool');

/*
 Удалить пользователя из друзей: Информация о друге (VID, или что то еще?)
 - Получаем свой профиль
 - Получаем профиль друга (из ОЗУ или БД)
 - Удаляем друг у друга из друзей (Сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) ???
 */
module.exports = function (socket, options, callback) {

    var selfProfile = oPool.userList[socket.id];


    if (selfProfile.getID() == options.id) {
      return callback(constants.errors.SELF_ILLEGAL);
    }

    var date = new Date();

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль друга

        getUserProfile(options.id, cb);

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

          cb(null, friendProfile);
        })

      }], function (err, friendProfile) { // Вызывается последней. Обрабатываем ошибки
        if (err) { return callback(err); }

        var friendInfo = fillInfo(friendProfile, date);

        if (oPool.profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
          var selfInfo = fillInfo(selfProfile, date);
          var friendSocket = friendProfile.getSocket();

          friendSocket.emit(constants.IO_NO_FRIEND, selfInfo);
        }
        
        callback(null, friendInfo);
    }); // waterfall


    //-------------------------
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

};


