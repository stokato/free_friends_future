var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    sanitize        = require('../../sanitizer'),
    constants = require('./../constants');

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
module.exports = function (socket, userList, profiles) {
  socket.on(constants.IO_GET_PROFILE, function(options) {
    if (!checkInput(constants.IO_GET_PROFILE, socket, userList, options)) { return; }

    var f = constants.FIELDS;
    var selfProfile = userList[socket.id];
    var selfInfo = fillInfo(selfProfile);

    options[f.id] = sanitize(options[f.id]);

    if (selfProfile.getID() == options[f.id]) { // Если открываем свой профиль
      async.waterfall([
        function (cb) { // Получаем историю чатов
          selfProfile.getPrivateChats(function (err, chats) {
            if (err) {  return cb(err, null); }

            selfInfo[f.chats] = chats;
            cb(null, null);
          });
        }, /////////////////////////////////////////////////////////////
        function (res, cb) { // Получаем подарки
          selfProfile.getGifts(function (err, gifts) {
            if (err) {  return cb(err, null); }

            selfInfo[f.gifts] = gifts;
            cb(null, null);
          });
        },/////////////////////////////////////////////////////////////////////
        function (res, cb) { // Получаем друзей
          selfProfile.getFriends(function (err, friends) {
            if (err) {  return cb(err, null); }

            selfInfo[f.friends] = friends;
            cb(null, null);
          });
        },/////////////////////////////////////////////////////////////////////
        function (res, cb) { // Получаем гостей
          selfProfile.getGuests(function (err, guests) {
            if (err) { return cb(err, null); }

            selfInfo[f.guests] = guests;
            cb(null, null);
          });
        }/////////////////////////////////////////////////////////////////////
      ], function(err, res) {
        if (err) { return new GameError(socket, constants.IO_GET_PROFILE, err.message); }

        socket.emit(constants.IO_GET_PROFILE, selfInfo);
      });
    } else {
      var isOnline = false;
      if(profiles[options[f.id]]) { isOnline = true }

      async.waterfall([///////////////////////////////////////////////////////////////////
        function (cb) { // Получаем профиль того, чей просматриваем
          var friendProfile = null;
          if (isOnline) { // Если онлайн
            friendProfile = profiles[options.id];
            var friendInfo = fillInfo(friendProfile);
            cb(null, friendProfile, friendInfo);
          } else {                // Если нет - берем из базы
            friendProfile = new profilejs();
            friendProfile.build(options[f.id], function (err, info) {
              if (err) { return cb(err, null); }

              var friendInfo = fillInfo(friendProfile);
              cb(null, friendProfile, friendInfo);
            });
          }
        },///////////////////////////////////////////////////////////////
        function (friendProfile, friendInfo, cb) { // Получаем подарки
          friendProfile.getGifts(function (err, gifts) {
            if (err) {  return cb(err, null); }

            friendInfo[f.gifts] = gifts;
            cb(null, friendProfile, friendInfo);
          });
        },/////////////////////////////////////////////////////////////////////
        function (friendProfile, friendInfo, cb) { // Проверяем, наш ли это друг
          friendProfile.isFriend(selfProfile.getID(), function (err, res) {
            if (err) {  return cb(err, null); }

            friendInfo[f.is_friend] = res[f.is_friend];
            cb(null, friendProfile, friendInfo);
          });
        },/////////////////////////////////////////////////////////////////////
        function (friendProfile, friendInfo, cb) { // Получаем друзей
          friendProfile.getFriends(function (err, friends) {
            if (err) {  return cb(err, null); }

            friendInfo[f.friends] = friends;
            cb(null, friendProfile, friendInfo);
          });
        },/////////////////////////////////////////////////////////////////////
        function (friendProfile, friendInfo, cb) { // Добавляем себя в гости
          var user = {};
          user[f.guestid] = selfProfile.getID();
          user[f.guestvid] = selfProfile.getVID();
          user[f.date] = new Date();
          friendProfile.addToGuests(user, function (err, res) {
            if (err) { return cb(err, null); }

            cb(null, friendProfile, friendInfo);
          });//////////////////////////////////////////////////////////////
        }], function (err, friendProfile, friendInfo) { // Вызывается последней. Обрабатываем ошибки
        if (err) { return new GameError(socket, constants.IO_GET_PROFILE, err.message); }

        //var friendInfo = fillInfo(friendProfile);
        socket.emit(constants.IO_GET_PROFILE, friendInfo); // Отправляем инфу

        if (isOnline) { // Если тот, кого просматирваем, онлайн, сообщаем о посещении
          var friendSocket = friendProfile.getSocket();
          friendSocket.emit(constants.IO_ADD_GUEST, selfInfo);
          friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
        }
      }); // waterfall
    }
  });
};

function fillInfo(profile) {
  var f = constants.FIELDS;
  var info = {};
  info[f.id]      = profile.getID();
  info[f.vid]     = profile.getVID();
  info[f.age]     = profile.getAge();
  info[f.sex]     = profile.getSex();
  info[f.city]    = profile.getCity();
  info[f.country] = profile.getCountry();
  info[f.status]  = profile.getStatus();
  info[f.points]  = profile.getPoints();

  return  info;
}

