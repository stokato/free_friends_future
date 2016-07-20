var async      =  require('async');
// Свои модули
var profilejs  =  require('../../profile/index'),          // Профиль
  GameError    = require('../../game_error'),
  checkInput   = require('../../check_input'),
  constants = require('./../constants'),
  dbjs         = require('../../db');

var dbManager = new dbjs();

/*
 Подарить монеты: объект с инф. о получателе (VID, еще что то?)
 - Проверяем свой баланс
 - Получаем профиль адресата (из ОЗУ или БД)
 - Добавляем адресату монет
 - Снимаем моенты со своего баланса
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket, userList, profiles) {
  socket.on(constants.IO_GIVE_MONEY, function(options) {
    if (!checkInput(constants.IO_GIVE_MONEY, socket, userList, options)) { return; }

    var f = constants.FIELDS;
    var selfProfile = userList[socket.id];

    if (selfProfile.getID() == options[f.id]) {
      options[f.rep_status] = f.fail;
      options[f.error] = 402;

      socket.emit(constants.IO_GIVE_MONEY, options);

      return new GameError(socket, constants.IO_GIVE_MONEY, "Нельзя сделать подарок себе");
    }


    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Проверяем, достаточно ли денег у пользователя
        selfProfile.getMoney(function (err, money) {
          if (err) { return cb(err, null) }

          if (constants.GIFT_MONEY <= money) {
            cb(null, money);
          } else {
            options[f.rep_status] = f.fail;
            options[f.error] = 405;

            socket.emit(constants.IO_GIVE_MONEY, options);

            cb(new Error("У вас недостаточно монет совершения подарка"), null);
          }
        });
      }, ///////////////////////////////////////////////////////////////
      function (money, cb) { // Получаем профиль адресата
        var friendProfile = null;

        if (profiles[options[f.id]]) { // Если онлайн
          friendProfile = profiles[options[f.id]];
          cb(null, friendProfile, money);
        } else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options[f.id], function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile, money);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (friendProfile, money, cb) { // Проверяем, наш ли это друг
        friendProfile.isFriend(selfProfile.getID(), function (err, res) {
          if (err) {  return cb(err, null); }

          if(res[f.is_friend]) {
            cb(null, friendProfile, money);
          } else {

            options[f.rep_status] = f.fail;
            options[f.error] = 406;

            socket.emit(constants.IO_GIVE_MONEY, options);

            return cb(new Error("Подарить монеты можно только своему другу"));
          }

        });
      },/////////////////////////////////////////////////////////////////////
      function(friendProfile, money, cb) { // Получаем баланс того, кому будем дарить
        friendProfile.getMoney(function (err, friendMoney) {
          if (err) { return cb(err, null) }


            cb(null, friendProfile, friendMoney, money);
        });
      }, /////////////////////////////////////////////////////////////
      function (friendProfile, friendMoney, money, cb) { // Сохраняем подарок
        var newMoney = friendMoney + constants.GIFT_MONEY;

        friendProfile.setMoney(newMoney, function (err, res) {
          if (err) { return cb(err, null); }

          var result = {};
          result[f.money] = newMoney;
          friendProfile.getSocket().emit(constants.IO_GET_MONEY, result);

          cb(null, money);
        });
      }, /////////////////////////////////////////////////////////////////
      function (money, cb) { // Снимаем деньги с пользователя
        var newMoney = money - constants.GIFT_MONEY;
        selfProfile.setMoney(newMoney, function (err, money) {
          if (err) { return cb(err, null); }

          var result = {};
          result[f.money] = money;
          socket.emit(constants.IO_GET_MONEY, result);

          cb(null, null);
        });
      } /////////////////////////////////////////////////////////////////
    ], function (err, res) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return new GameError(socket, constants.IO_MAKE_GIFT, err.message); }

      options[f.rep_status] = f.succes;
      options[f.error] = null;

      socket.emit(constants.IO_MAKE_GIFT, options);

      if (profiles[options[f.id]]) {
        var friendProfile = profiles[options[f.id]];
        var friendSocket = friendProfile.getSocket();

        //friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
      }
    }); // waterfall
  });
};


