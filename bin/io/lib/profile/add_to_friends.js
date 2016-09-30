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
        
        addToFriend(selfProfile, friendProfile, date, cb);

      },
      function (selfProfile, friendProfile, date, cb) {
        
        addToFriend(friendProfile, selfProfile, date, cb);
        
      }], function (err, friendProfile) { // Вызывается последней. Обрабатываем ошибки
        if (err) { return callback(err); }
      
        var friendInfo = fillInfo(friendProfile, date);
        
        // friendInfo.operation_status = constants.RS_GOODSTATUS;
        // socket.emit(constants.IO_ADD_FRIEND, friendInfo);
        
        if (oPool.isProfile(friendProfile.getID())) { // Если друг онлайн, то и ему
          var selfInfo = fillInfo(selfProfile, date);
          
          var friendSocket = friendProfile.getSocket();
          friendSocket.emit(constants.IO_NEW_FRIEND, selfInfo);
          
          friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
        }
        
        callback(null, friendInfo);
    }); // waterfall
    
    //--------------
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
    
    function addToFriend(sProfile, fProfile, date, callback) {
      var user = {};
      user.friendid  = sProfile.getID();
      user.friendvid = sProfile.getVID();
      user.date = date;
  
      fProfile.addToFriends(user, function (err, res) {
        if (err) { return callback(err, null); }
  
        callback(null, sProfile, fProfile, date);
      })
    }

};




