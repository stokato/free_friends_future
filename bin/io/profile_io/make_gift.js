var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
  dbjs      = require('../../db/index'),
  GameError = require('../../game_error'),
  checkInput = require('../../check_input');

var db = new dbjs();
/*
 Сделать подарок: ИД подарка, объект с инф. о получателе (VID, еще что то?)
 - Ищем подарок по ИД в базе
 - Получаем профиль адресата (из ОЗУ или БД)
 - Добавляем адресату подарок (пишем сразу в БД)
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket, userList, profiles) {
  socket.on('make_gift', function(options) {
    if (!checkInput('make_gift', socket, userList, options))
      return new GameError(socket, "MAKEGIFT", "Верификация не пройдена");

    if (userList[socket.id].getID() == options.id)
      return new GameError(socket, "MAKEGIFT", "Нельзя сделать подарок себе");

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Ищим подарок с таким id в базе данных
        db.findGood(options.giftid, function (err, gift) {
          if (err) { return cb(err, null) }

          if (gift) {
            cb(null, gift);
          } else cb(new Error("Нет такого подарка"), null);
        });
      },///////////////////////////////////////////////////////////////
      function (gift, cb) { //
        var money = userList[socket.id].getMoney();
        if (money < gift.price) {
          cb(new Error("Недостаточно монет для совершения подарка"), null);
        } else {
          userList[socket.id].setMoney(money - gift.price, function (err, money) {
            if (err) { return cb(err, null); }

            socket.emit('money', {money: money});
            cb(null, gift);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (gift, cb) { // Получаем профиль адресата
        var recProfile = null;

        if (profiles[options.id]) { // Если онлайн
          recProfile = profiles[options.id];
          cb(null, recProfile, gift);
        }
        else {                // Если нет - берем из базы
          recProfile = new profilejs();
          recProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, recProfile, gift);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (recProfile, gift, cb) { // Сохраняем подарок
        var selfProfile = userList[socket.id];
        var date = new Date();
        gift.fromid = selfProfile.getID();
        gift.fromvid = selfProfile.getVID();
        gift.date = date;
        recProfile.addGift(gift, function (err, result) {
          if (err) { return cb(err, null); }

          cb(null, gift);
        });
      }
    ], function (err, gift) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return new GameError(socket, "MAKEGIFT", err.message); }

      if (profiles[options.id]) {
        var recProfile = profiles[options.id];
        var recSocket = recProfile.getSocket();
        var info = {
          giftid  : gift.id,
          type    : gift.type,
          data    : gift.data,
          date    : gift.date,
          fromid  : gift.fromid,
          fromvid : gift.fromvid,
          title   : gift.title
        };
        recSocket.emit('make_gift', info);
        recSocket.emit('get_news', recProfile.getNews());
      }
    }); // waterfall
  });
};


