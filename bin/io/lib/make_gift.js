var async      =  require('async');
// Свои модули
var profilejs  =  require('../../profile/index'),          // Профиль
  GameError    = require('../../game_error'),
  checkInput   = require('../../check_input'),
  constants = require('./../constants'),
  dbjs         = require('../../db');

var dbManager = new dbjs();

/*
 Сделать подарок: ИД подарка, объект с инф. о получателе (VID, еще что то?)
 - Ищем подарок по ИД в базе
 - Получаем профиль адресата (из ОЗУ или БД)
 - Добавляем адресату подарок (пишем сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket, userList, profiles) {
  socket.on(constants.IO_MAKE_GIFT, function(options) {
    if (!checkInput(constants.IO_MAKE_GIFT, socket, userList, options)) { return; }

    var f = constants.FIELDS;
    var selfProfile = userList[socket.id];

    if (selfProfile.getID() == options[f.id]) {
      return new GameError(socket, constants.IO_MAKE_GIFT, "Нельзя сделать подарок себе");
    }

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Проверяем, купил ли пользователь такой подарок
        selfProfile.getPurchase(options[f.giftid], function (err, good) {
          if (err) { return cb(err, null) }

          if (good) {
            cb(null, good);
          } else {
            cb(new Error("Среди покупок пользователя нет такого товара"), null);
          }
        });
      }, ///////////////////////////////////////////////////////////////
      function (good, cb) { // Ищем подарок в магазине
        dbManager.findGood(options[f.giftid], function (err, gift) {
          if (err) { return cb(err, null) }

          if (gift) {
            if(gift[f.goodtype] != constants.GT_GIFT) {
              cb(new Error("Этот товар нельзя дарить"), null);
            } else {
              cb(null, gift);
            }
          } else {
            cb(new Error("В магазине нет такого товара"), null);
          }
        });
      }, ///////////////////////////////////////////////////////////////
      function (gift, cb) { // Получаем профиль адресата
        var friendProfile = null;

        if (profiles[options[f.id]]) { // Если онлайн
          friendProfile = profiles[options[f.id]];
          cb(null, friendProfile, gift);
        } else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options[f.id], function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile, gift);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (friendProfile, gift, cb) { // Сохраняем подарок
        var date = new Date();
        gift[f.fromid]  = selfProfile.getID();
        gift[f.fromvid] = selfProfile.getVID();
        gift[f.date]    = date;
        friendProfile.addGift(gift, function (err, result) {
          if (err) { return cb(err, null); }

          cb(null, gift);
        });
      }, /////////////////////////////////////////////////////////////////
      function (gift, cb) { // Удаляем покупку
        selfProfile.deletePurchase(options[f.id], function (err, result) {
          if (err) { return cb(err, null); }

          cb(null, gift);
        });
      } /////////////////////////////////////////////////////////////////
    ], function (err, gift) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return new GameError(socket, constants.IO_MAKE_GIFT, err.message); }

      if (profiles[options[f.id]]) {
        var friendProfile = profiles[options[f.id]];
        var friendSocket = friendProfile.getSocket();

        friendSocket.emit(constants.IO_MAKE_GIFT, gift);
        friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
      }
    }); // waterfall
  });
};


