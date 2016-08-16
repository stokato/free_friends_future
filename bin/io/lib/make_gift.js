var async      =  require('async');
// Свои модули
var profilejs  =  require('../../profile/index'),          // Профиль
  GameError    = require('../../game_error'),
  checkInput   = require('../../check_input'),
  constants = require('./../../constants'),
  //sanitize        = require('../../sanitizer'),
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

    var selfProfile = userList[socket.id];

    //options.id = sanitize(options.id);

    if (selfProfile.getID() == options.id) {
      return handError(constants.errors.SELF_ILLEGAL);
    }

    var date = new Date();

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Ищем подарок в магазине
        dbManager.findGood(options.giftid, function (err, gift) {
          if (err) { return cb(err, null) }

          if (gift) {
            if(gift.goodtype != constants.GT_GIFT) {
              cb(constants.errors.NO_SUCH_GOOD, null);
            } else {
              cb(null, gift);
            }
          } else {
            cb(constants.errors.NO_SUCH_GOOD, null);
          }
        });
      }, ///////////////////////////////////////////////////////////////
      function (gift, cb) { // Проверяем, достаточно ли денег у пользователя
        selfProfile.getMoney(function (err, money) {
          if (err) { return cb(err, null) }

          if (gift.price <= money) {
            cb(null, gift, money);
          } else {
            cb(constants.errors.TOO_LITTLE_MONEY, null);
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

        var params = {};
        params.fromid  = selfProfile.getID();
        params.fromvid = selfProfile.getVID();
        params.date    = date;
        params.src     = gift.src;
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

          socket.emit(constants.IO_GET_MONEY, {
            money : money,
            operation_status : constants.RS_GOODSTATUS
          });

          cb(null, null);
        });

      } /////////////////////////////////////////////////////////////////
    ], function (err, res) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return handError(err); }

      socket.emit(constants.IO_MAKE_GIFT, { operation_status : constants.RS_GOODSTATUS });

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
        result.is_private = options.is_private;

        var room = roomList[socket.id];

        socket.emit(constants.IO_NEW_GIFT, result);
        if(!options.is_private) {
          socket.broadcast.in(room.name).emit(constants.IO_NEW_GIFT, result);
        } else {
          friendSocket.emit(constants.IO_NEW_GIFT, result);
        }

        friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
      }
    }); // waterfall

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_MAKE_GIFT, res);

      new GameError(socket, constants.IO_MAKE_GIFT, err.message || constants.errors.OTHER.message);
    }
  });
};


