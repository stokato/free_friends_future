var async      =  require('async');

// Свои модули
var constants         = require('./../../../constants'),
  getUserProfile      = require('./../common/get_user_profile'),
  setGiftTimeout      = require('./../common/set_gift_timeout'),
  db                  = require('./../../../db_manager'),
  oPool               = require('./../../../objects_pool');

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
      
      function (gift, cb) { // Получаем профиль адресата
        
        getUserProfile(options.id, function (err, friendProfile) {
          if(err) { return cb(err); }
          
          cb(null, friendProfile, gift);
        });
        
      }, /////////////////////////////////////////////////////////////////
      function (friendProfile, gift, cb) { // Снимаем деньги с пользователя
        selfProfile.pay(gift.price, function (err, money) {
          if(err) { return cb(err, null); }
          
          socket.emit(constants.IO_GET_MONEY, { money : money });
          
          cb(null, friendProfile, gift);
        });
      },///////////////////////////////////////////////////////////////
      function (friendProfile, gift, cb) { // Сохраняем подарок

        friendProfile.addGift(selfProfile, date, gift, function (err, result) {
          if (err) { return cb(err, null); }

          cb(null, null);
        });

      } /////////////////////////////////////////////////////////////////
    ], function (err, res) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return callback(err); }

      if (oPool.isProfile(options.id)) {
        var friendProfile = oPool.profiles[options.id];
        var friendSocket = friendProfile.getSocket();

        var gift = friendProfile.getGift1();

        var result = {
          fromid : selfProfile.getID(),
          fromvid : selfProfile.getVID,
          id      : friendProfile.getID(),
          vid     : friendProfile.getVID(),
          giftid  : gift.giftid,
          src     : gift.src,
          type    : gift.type,
          title   : gift.title,
          date    : gift.date,
          gid     : gift.gid,
          is_private : options.is_private
        };

        var room = oPool.roomList[socket.id];

        socket.emit(constants.IO_NEW_GIFT, result);
        
        if(!options.is_private) {
          socket.broadcast.in(room.getName()).emit(constants.IO_NEW_GIFT, result);
        } else {
          friendSocket.emit(constants.IO_NEW_GIFT, result);
        }

        // friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());

        setGiftTimeout(friendProfile.getID());
        
        callback(null, null);
      }
    }); // waterfall
};


