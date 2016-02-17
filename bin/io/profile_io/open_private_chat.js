var async = require('async');
var profilejs =  require('../../profile/index'),
  GameError = require('../../game_error'),
  checkInput = require('../../check_input'),
  genDateHistory = require('./gen_date_history');

module.exports = function(socket, userList, profiles) {
  socket.on('open_private_chat', function(options) {
    if (!checkInput('open_private_chat', socket, userList, options))
      return new GameError(socket, "OPENPRIVCHAT", "Верификация не пройдена");

    async.waterfall([
      function(cb) {
        var compProfile;
        if (profiles[options.id]) { // Если онлайн
          compProfile = profiles[options.id];
          cb(null, compProfile);
        }
        else {                // Если нет - берем из базы
          compProfile = new profilejs();
          compProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, compProfile);
          });
        }
      },
      function(compProfile, cb) { ////////////////////// Отрываем чат для одного и отрпавляем ему историю
        var selfProfile = userList[socket.id];

        if(selfProfile.getID() == options.id) {
          return cb(new Error("Попытка открыть чат с самим сабой"))
        }
        var firstDate = genDateHistory(new Date);
        var chat = { id : compProfile.getID(), vid : compProfile.getVID(), date : firstDate };
        selfProfile.addPrivateChat(chat, function(err, chatInfo) {
          if(err) { return cb(err, null); }

          socket.emit('open_private_chat', chatInfo);

          cb(null, selfProfile, compProfile, firstDate);
        });

      },  ///////////////////////////////// Открываем чат второму и тоже отправляем историю
      function(selfProfile, compProfile, firstDate, cb) {
        if (profiles[options.id]) {
          var chat = { id : selfProfile.getID(), vid : selfProfile.getVID(), date : firstDate };
          compProfile.addPrivateChat(chat, function (err, chatInfo) {
            if (err) { cb(err, null); }

            var compSocket = compProfile.getSocket();
            compSocket.emit('open_private_chat', chatInfo);
          });
        }
        cb(null, null);
      }
    ], function(err, res) {
      if (err) { return new GameError(socket, "OPENPRIVCHAT", err.message); }

    });
  });
};
