var async      =  require('async');

// Свои модули
var constants = require('./../../../constants'),
  getUserProfile     = require('./../common/get_user_profile'),
  setGiftTimeout = require('./../common/set_gift_timeout'),
  db         = require('./../../../db_manager');

var oPool = require('./../../../objects_pool');

/*
 Сделать подарок: ИД подарка, объект с инф. о получателе (VID, еще что то?)
 - Ищем подарок по ИД в базе
 - Получаем профиль адресата (из ОЗУ или БД)
 - Добавляем адресату подарок (пишем сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket, options, callback) {

    var selfProfile = oPool.userList[socket.id];

    if (selfProfile.getID() == options.id) {
      return callback(constants.errors.SELF_ILLEGAL);
    }

    var date = new Date();

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Ищем подарок в магазине
        db.findGood(options.giftid, function (err, gift) {
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
        
        getUserProfile(options.id, function (err, friendProfile) {
          if(err) { cb(err); }
          
          cb(null, friendProfile, gift, money);
        });
        
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
      if (err) { return callback(err); }

      if (oPool.isProfile(options.id)) {
        var friendProfile = oPool.profiles[options.id];
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

        var room = oPool.roomList[socket.id];

        socket.emit(constants.IO_NEW_GIFT, result);
        if(!options.is_private) {
          socket.broadcast.in(room.name).emit(constants.IO_NEW_GIFT, result);
        } else {
          friendSocket.emit(constants.IO_NEW_GIFT, result);
        }

        friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());

        setGiftTimeout(friendProfile.getID());
        
        callback(null, null);
      }
    }); // waterfall
};


