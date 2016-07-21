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
      function (cb) { // Получаем профиль адресата
        var friendProfile = null;

        if (profiles[options[f.id]]) { // Если онлайн
          friendProfile = profiles[options[f.id]];
          cb(null, friendProfile);
        } else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options[f.id], function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      }///////////////////////////////////////////////////////////////
    ], function (err, res) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return new GameError(socket, constants.IO_GIVE_MONEY, err.message); }

      options[f.rep_status] = f.succes;
      options[f.error] = null;

      //socket.emit(constants.IO_GIVE_MONEY, options);

      if (profiles[options[f.id]]) {
        var friendProfile = profiles[options[f.id]];
        var friendSocket = friendProfile.getSocket();

        var result = {};
        result[f.id] = selfProfile.getID();
        result[f.vid] = selfProfile.getVID();
        result[f.money] = options[f.money];

        friendSocket.emit(constants.IO_GIVE_MONEY, result);
      }
    }); // waterfall
  });
};


