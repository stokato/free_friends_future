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
      function (cb) { // Ищем подарок в магазине
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
      function (gift, cb) { // Проверяем, достаточно ли денег у пользователя
        selfProfile.getMoney(function (err, money) {
          if (err) { return cb(err, null) }

          if (gift[f.price] <= money) {
            cb(null, gift, money);
          } else {
            cb(new Error("У вас недостаточно монет для покупки подарка"), null);
          }
        });
      }, ///////////////////////////////////////////////////////////////
      function (gift, money, cb) { // Получаем профиль адресата
        var friendProfile = null;

        if (profiles[options[f.id]]) { // Если онлайн
          friendProfile = profiles[options[f.id]];
          cb(null, friendProfile, gift, money);
        } else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options[f.id], function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile, gift, money);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (friendProfile, gift, money, cb) { // Сохраняем подарок
        var date = new Date();
        //gift[f.fromid]  = selfProfile.getID();
        //gift[f.fromvid] = selfProfile.getVID();
        //gift[f.date]    = date;

        var params = {};
        params[f.fromid]  = selfProfile.getID();
        params[f.fromvid] = selfProfile.getVID();
        params[f.date]    = date;
        params[f.data]    = gift[f.data];
        params[f.giftid]  = gift[f.id];
        params[f.type]    = gift[f.type];
        params[f.title]   = gift[f.title];

        friendProfile.addGift(params, function (err, result) {
          if (err) { return cb(err, null); }

          cb(null, gift, money);
        });
      }, /////////////////////////////////////////////////////////////////
      function (gift, money, cb) { // Снимаем деньги с пользователя
        var newMoney = money - gift[f.price];
        selfProfile.setMoney(newMoney, function (err, money) {
          if (err) { return cb(err, null); }

          var result = {};
          result[f.money] = money;
          socket.emit(constants.IO_GET_MONEY, result);

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


