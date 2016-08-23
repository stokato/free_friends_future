var async     =  require('async');

// Свои модули
var constants = require('./../../constants'),
    profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');

var oPool = require('./../../objects_pool');

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
module.exports = function (socket) {
  socket.on(constants.IO_GET_PROFILE, function(options) {
    if (!checkInput(constants.IO_GET_PROFILE, socket, options)) { return; }

    var selfProfile = oPool.userList[socket.id];
    var selfInfo = fillInfo(selfProfile);

    //options.id = sanitize(options.id);

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
        if (err) { return handError(err); }

        selfInfo.operation_status = constants.RS_GOODSTATUS;
        socket.emit(constants.IO_GET_PROFILE, selfInfo);
      });

    } else {
      var isOnline = false;
      if(oPool.profiles[options.id]) { isOnline = true }

      async.waterfall([///////////////////////////////////////////////////////////////////
        function (cb) { // Получаем профиль того, чей просматриваем

          var friendProfile = null;
          if (isOnline) { // Если онлайн
            friendProfile = oPool.profiles[options.id];
            var friendInfo = fillInfo(friendProfile);
            cb(null, friendProfile, friendInfo);

          } else {                // Если нет - берем из базы
            friendProfile = new profilejs();
            friendProfile.build(options.id, function (err, info) {
              if (err) { return cb(err, null); }

              var friendInfo = fillInfo(friendProfile);
              cb(null, friendProfile, friendInfo);
            });
          }
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
          var user = {};
          user.guestid = selfProfile.getID();
          user.guestvid = selfProfile.getVID();
          user.date = new Date();
          friendProfile.addToGuests(user, function (err, res) {
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
        if (err) { return handError(options, err.message); }


        //var friendInfo = fillInfo(friendProfile);

        friendInfo.operation_status = constants.RS_GOODSTATUS;
        socket.emit(constants.IO_GET_PROFILE, friendInfo); // Отправляем инфу

        if (isOnline) { // Если тот, кого просматирваем, онлайн, сообщаем о посещении
          var friendSocket = friendProfile.getSocket();
          friendSocket.emit(constants.IO_ADD_GUEST, selfInfo);
          friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
        }
      }); // waterfall
    }

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_GET_PROFILE, res);

      new GameError(socket, constants.IO_GET_PROFILE, err.message || constants.errors.OTHER.message);
    }

    function fillInfo(profile) {
      var info = {};
      info.id      = profile.getID();
      info.vid     = profile.getVID();
      info.age     = profile.getAge();
      info.sex     = profile.getSex();
      info.city    = profile.getCity();
      info.country = profile.getCountry();
      info.status  = profile.getStatus();
      info.points  = profile.getPoints();

      return  info;
    }

  });
};


