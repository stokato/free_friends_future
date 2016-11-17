var async     =  require('async');

// Свои модули
var constants = require('./../../../constants'),
  getUserProfile = require('./../common/get_user_profile');

var oPool = require('./../../../objects_pool');

/*
 Получаем профиль (Нужна ли вообще такая функция, если в окне профиля только инф,
 которую можно достать из соц. сетей ????)
 - Если смотрим свой профиль - отправляем клиенту наши данные (какие ?)
 - Если чужой
 -- Получам профиль того, кого смотрим (из ОЗУ или БД)
 -- Добавляем себя ему в гости (пишем сразу в БД)
 -- Отправлем клиенту данные профиля (????)
 -- Если тот, кого смотрим, онлайн, наверно нужно его сразу уведомить о гостях ???
 */
module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  var selfInfo = {
    id      : selfProfile.getID(),
    vid     : selfProfile.getVID(),
    age     : selfProfile.getAge(),
    sex     : selfProfile.getSex(),
    city    : selfProfile.getCity(),
    country : selfProfile.getCountry(),
    status  : selfProfile.getStatus(),
    points  : selfProfile.getPoints()
  };
  
  if (selfProfile.getID() == options.id) { // Если открываем свой профиль
    async.waterfall([
      function (cb) { // Получаем историю чатов
        selfProfile.getPrivateChats(function (err, chats) {
          if (err) {  return cb(err, null); }
          
          selfInfo.chats = chats;
          cb(null, null);
        });
      }, /////////////////////////////////////////////////////////////
      function (res, cb) { // Получаем подарки
        selfProfile.getGifts(function (err, gifts) {
          if (err) {  return cb(err, null); }
          
          selfInfo.gifts = gifts;
          cb(null, null);
        });
      },/////////////////////////////////////////////////////////////////////
      function (res, cb) { // Получаем друзей
        selfProfile.getFriends(true, function (err, friends) {
          if (err) {  return cb(err, null); }
          
          selfInfo.friends = friends;
          cb(null, null);
        });
      },/////////////////////////////////////////////////////////////////////
      function (res, cb) { // Получаем гостей
        selfProfile.getGuests(true, function (err, guests) {
          if (err) { return cb(err, null); }
          
          selfInfo.guests = guests;
          cb(null, null);
        });
      }/////////////////////////////////////////////////////////////////////
    ], function(err, res) {
      if (err) { return callback(err); }
      
      callback(null, selfInfo);
    });
    
  } else {
    
    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль того, чей просматриваем
        
        getUserProfile(options.id, function (err, friendProfile) {
          if(err) { return cb(err); }
          
          cb(null, friendProfile, {
            id      : friendProfile.getID(),
            vid     : friendProfile.getVID(),
            age     : friendProfile.getAge(),
            sex     : friendProfile.getSex(),
            city    : friendProfile.getCity(),
            country : friendProfile.getCountry(),
            status  : friendProfile.getStatus(),
            points  : friendProfile.getPoints()
          });
        });
        
      },///////////////////////////////////////////////////////////////
      function (friendProfile, friendInfo, cb) { // Получаем подарки
        friendProfile.getGifts(function (err, gifts) {
          if (err) {  return cb(err, null); }
          
          
          friendInfo.gifts = gifts;
          cb(null, friendProfile, friendInfo);
        });
      },/////////////////////////////////////////////////////////////////////
      function (friendProfile, friendInfo, cb) { // Проверяем, наш ли это друг
        friendProfile.isFriend([selfProfile.getID()], function (err, res) {
          if (err) {  return cb(err, null); }
          
          friendInfo.is_friend = res[0].isFriend;
          cb(null, friendProfile, friendInfo);
        });
      },/////////////////////////////////////////////////////////////////////
      function (friendProfile, friendInfo, cb) { // Получаем друзей
        friendProfile.getFriends(false, function (err, friends) {
          if (err) {  return cb(err, null); }
          
          friendInfo.friends = friends;
          cb(null, friendProfile, friendInfo);
        });
      },/////////////////////////////////////////////////////////////////////
      function (friendProfile, friendInfo, cb) { // Добавляем себя в гости
        var date = new Date();
        friendProfile.addToGuests(selfProfile, date, function (err, res) {
          if (err) { return cb(err, null); }
          
          cb(null, friendProfile, friendInfo);
        });
      },/////////////////////////////////////////////////////////////////////
      function (friendProfile, friendInfo, cb) { // Получаем гостей
        friendProfile.getGuests(false, function (err, guests) {
          if (err) { return cb(err, null); }
          
          friendInfo.guests = guests;
          cb(null, friendProfile, friendInfo);
        });
      }/////////////////////////////////////////////////////////////////////
    ], function (err, friendProfile, friendInfo) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return callback(err); }
      
      if (oPool.isProfile(friendProfile.getID())) { // Если тот, кого просматирваем, онлайн, сообщаем о посещении
        var friendSocket = friendProfile.getSocket();
        friendSocket.emit(constants.IO_ADD_GUEST, selfInfo);
        friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
      }
      
      callback(null, friendInfo);
    }); // waterfall
  }
  
};


