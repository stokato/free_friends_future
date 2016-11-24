var async     =  require('async');

// Свои модули
var constants       = require('./../../../constants'),
    PF              = constants.PFIELDS,
    getUserProfile  = require('./../common/get_user_profile'),
    oPool           = require('./../../../objects_pool');

/*
 Удалить пользователя из друзей: Информация о друге (VID, или что то еще?)
 - Получаем свой профиль
 - Получаем профиль друга (из ОЗУ или БД)
 - Удаляем друг у друга из друзей (Сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) ???
 */
module.exports = function (socket, options, callback) {

    var selfProfile = oPool.userList[socket.id];


    if (selfProfile.getID() == options[PF.ID]) {
      return callback(constants.errors.SELF_ILLEGAL);
    }

    var date = new Date();

    async.waterfall([//--------------------------------------------------------
      function (cb) { // Получаем профиль друга

        getUserProfile(options[PF.ID], cb);

      },//--------------------------------------------------------
      function (friendProfile, cb) { // Удаляем первого из друзей

        friendProfile.delFromFriends(selfProfile.getID(), function (err, res) {
          if (err) { return cb(err, null); }

          cb(null, friendProfile);
        })

      },//--------------------------------------------------------
      function (friendProfile, cb) { // Удаляем второго

        selfProfile.delFromFriends(friendProfile.getID(), function (err, res) {
          if (err) { return cb(err, null); }

          cb(null, friendProfile);
        })

      }], //--------------------------------------------------------
      function (err, friendProfile) { // Вызывается последней. Обрабатываем ошибки
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
    
    var res = {};
    res[PF.ID]      = profile.getID();
    res[PF.VID]     = profile.getVID();
    res[PF.DATE]    = date;
    res[PF.POINTS]  = profile.getPoints();
    res[PF.AGE]     = profile.getAge();
    res[PF.CITY]    = profile.getCity();
    res[PF.COUNTRY] = profile.getCountry();
    res[PF.SEX]     = profile.getSex();
    
    return res;
  }

};


