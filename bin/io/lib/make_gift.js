var async      =  require('async');
// Свои модули
var profilejs  =  require('../../profile/index'),          // Профиль
  GameError    = require('../../game_error'),
  checkInput   = require('../../check_input'),
  constants = require('./../constants'),
  sanitize        = require('../../sanitizer'),
  dbjs         = require('../../db');

var dbManager = new dbjs();

/*
 Сделать подарок: ИД подарка, объект с инф. о получателе (VID, еще что то?)
 - Ищем подарок по ИД в базе
 - Получаем профиль адресата (из ОЗУ или БД)
 - Добавляем адресату подарок (пишем сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket, userList, profiles, roomList) {
  socket.on(constants.IO_MAKE_GIFT, function(options) {
    if (!checkInput(constants.IO_MAKE_GIFT, socket, userList, options)) { return; }

    //var f = constants.FIELDS;
    var selfProfile = userList[socket.id];

    options.id = sanitize(options.id);

    if (selfProfile.getID() == options.id) {
      options.status = "fail";
      options.error = 402;

      socket.emit(constants.IO_MAKE_GIFT, options);

      return new GameError(socket, constants.IO_MAKE_GIFT, "Нельзя сделать подарок себе");
    }

    var date = new Date();

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Ищем подарок в магазине
        dbManager.findGood(options.giftid, function (err, gift) {
          if (err) { return cb(err, null) }

          if (gift) {
            if(gift.goodtype != constants.GT_GIFT) {
              options.status = "fail";
              options.error = 401;

              socket.emit(constants.IO_MAKE_GIFT, options);

              cb(new Error("Этот товар нельзя дарить"), null);
            } else {
              cb(null, gift);
            }
          } else {
            options.rep_status = "fail";
            options.error = 401;

            socket.emit(constants.IO_MAKE_GIFT, options);

            cb(new Error("В магазине нет такого товара"), null);
          }
        });
      }, ///////////////////////////////////////////////////////////////
      function (gift, cb) { // Проверяем, достаточно ли денег у пользователя
        selfProfile.getMoney(function (err, money) {
          if (err) { return cb(err, null) }

          if (gift.price <= money) {
            cb(null, gift, money);
          } else {
            options.status = "fail";
            options.error = 405;

            socket.emit(constants.IO_MAKE_GIFT, options);

            cb(new Error("У вас недостаточно монет для покупки подарка"), null);
          }
        });
      }, ///////////////////////////////////////////////////////////////
      function (gift, money, cb) { // Получаем профиль адресата
        var friendProfile = null;

        if (profiles[options.id]) { // Если онлайн
          friendProfile = profiles[options.id];
          cb(null, friendProfile, gift, money);
        } else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile, gift, money);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (friendProfile, gift, money, cb) { // Сохраняем подарок

        //gift[f.fromid]  = selfProfile.getID();
        //gift[f.fromvid] = selfProfile.getVID();
        //gift[f.date]    = date;

        var params = {};
        params.fromid  = selfProfile.getID();
        params.fromvid = selfProfile.getVID();
        params.date    = date;
        params.data    = gift.data;
        params.giftid  = gift.id;
        params.type    = gift.type;
        params.title   = gift.title;

        friendProfile.addGift(params, function (err, result) {
          if (err) { return cb(err, null); }

          cb(null, gift, money);
        });
      }, /////////////////////////////////////////////////////////////////
      function (gift, money, cb) { // Снимаем деньги с пользователя
        var newMoney = money - gift.price;
        selfProfile.setMoney(newMoney, function (err, money) {
          if (err) { return cb(err, null); }

          var result = {};
          result.money = money;
          socket.emit(constants.IO_GET_MONEY, result);

          cb(null, gift);
        });
      } /////////////////////////////////////////////////////////////////
    ], function (err, gift) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return new GameError(socket, constants.IO_MAKE_GIFT, err.message); }

      options.rep_status = "succes";
      options.error = null;

      socket.emit(constants.IO_MAKE_GIFT, options);

      if (profiles[options.id]) {
        var friendProfile = profiles[options.id];
        var friendSocket = friendProfile.getSocket();

        var gift = friendProfile.getGift1();

        var result = {};
        result.fromid  = selfProfile.getID();
        result.fromvid = selfProfile.getVID();
        result.id      = friendProfile.getID();
        result.vid     = friendProfile.getVID();
        result.giftid  = gift.giftid;
        result.src     = gift.src;
        result.type    = gift.type;
        result.title   = gift.title;
        result.date    = gift.date;
        result.gid     = gift.gid;

        var room = roomList[socket.id];

        socket.emit(constants.IO_NEW_GIFT, result);
        socket.broadcast.in(room.name).emit(constants.IO_NEW_GIFT, result);

        friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
      }
    }); // waterfall
  });
};


