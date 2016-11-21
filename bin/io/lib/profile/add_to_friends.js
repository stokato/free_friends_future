var async     =  require('async');
// Свои модули
var constants  = require('./../../../constants'),
  getUserProfile = require('./../common/get_user_profile');

var oPool = require('./../../../objects_pool');

/*
 Добавить пользователя в друзья: Информация о друге (VID)
 - Получаем свой профиль
 - Получаем профиль друга (из ОЗУ или БД)
 - Добдавляем друг другу в друзья (Сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн)
 */
module.exports = function (socket, options, callback) {
    
    var selfProfile = oPool.userList[socket.id];
    
    if (selfProfile.getID() == options.id) {
      callback(constants.errors.SELF_ILLEGAL);
    }
    
    var date = new Date();
    
    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль друга
        
        getUserProfile(options.id, cb);
        
      },///////////////////////////////////////////////////////////////
      function (friendProfile, cb) {
        
        selfProfile.addToFriends(friendProfile, date, function (err, res) {
          if (err) { return cb(err, null); }
    
          cb(null, selfProfile, friendProfile, date);
        })

      },
      function (selfProfile, friendProfile, date, cb) {
  
        friendProfile.addToFriends(selfProfile, date, function (err, res) {
          if (err) { return cb(err, null); }
    
          cb(null, friendProfile, selfProfile, date);
        })
        
      }], function (err, friendProfile) { // Вызывается последней. Обрабатываем ошибки
        if (err) { return callback(err); }
      
        var friendInfo = fillInfo(friendProfile, date);
        
        if (oPool.isProfile(friendProfile.getID())) { // Если друг онлайн, то и ему
          var selfInfo = fillInfo(selfProfile, date);
          
          var friendSocket = friendProfile.getSocket();
          friendSocket.emit(constants.IO_NEW_FRIEND, selfInfo);
          
          // friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
        }
        
        callback(null, friendInfo);
    }); // waterfall
    
    //--------------
    function fillInfo(profile, date) {
      return {
        id      : profile.getID(),
        vid     : profile.getVID(),
        date    : date,
        points  : profile.getPoints(),
        age     : profile.getAge(),
        city    : profile.getCity(),
        country : profile.getCountry(),
        sex     : profile.getSex()
      };
    }

};




