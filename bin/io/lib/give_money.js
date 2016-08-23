var async       =  require('async');
// Свои модули
var constants   = require('./../../constants'),
  profilejs     =  require('../../profile/index'),          // Профиль
  GameError     = require('../../game_error'),
  checkInput    = require('../../check_input'),
  db            = require('../../db_manager');

var oPool       = require('./../../objects_pool');

/*
 Подарить монеты: объект с инф. о получателе (VID, еще что то?)
 - Проверяем свой баланс
 - Получаем профиль адресата (из ОЗУ или БД)
 - Добавляем адресату монет
 - Снимаем моенты со своего баланса
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket) {
  socket.on(constants.IO_GIVE_MONEY, function(options) {
    if (!checkInput(constants.IO_GIVE_MONEY, socket, options)) { return; }


    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль адресата
        var friendProfile = null;

        if (oPool.profiles[options.id]) { // Если онлайн
          friendProfile = oPool.profiles[options.id];
          cb(null, friendProfile);

        } else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      }///////////////////////////////////////////////////////////////
    ], function (err, res) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return handError(err); }

      //socket.emit(constants.IO_GIVE_MONEY, {
      //  operation_status : constants.RS_GOODSTATUS
      //});

      if (oPool.profiles[options.id]) {
        var friendProfile = oPool.profiles[options.id];
        var friendSocket = friendProfile.getSocket();

        friendSocket.emit(constants.IO_GIVE_MONEY, options);
      }
    }); // waterfall


    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_GIVE_MONEY, res);

      new GameError(socket, constants.IO_GIVE_MONEY, err.message || constants.errors.OTHER.message);
    }
  });
};


