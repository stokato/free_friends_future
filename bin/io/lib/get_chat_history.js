var async         = require('async');
var profilejs     =  require('../../profile/index'),
  GameError       = require('../../game_error'),
  checkInput      = require('../../check_input'),
  sendOne         = require('./send_one'),
  sanitize        = require('../../sanitizer'),
  constants       = require('./../constants') ;

module.exports = function(socket, userList, profiles) {
  socket.on(constants.IO_GET_CHAT_HISTORY, function(options) {
    if (!checkInput(constants.IO_GET_CHAT_HISTORY, socket, userList, options)) { return; }
    var f = constants.FIELDS;

    options[f.id] = sanitize(options[f.id]);

    async.waterfall([ ///////////////////////////////////////////////////////////////////
      function(cb) {
        var friendProfile;
        if (profiles[options[f.id]]) { // Если онлайн
          friendProfile = profiles[options[f.id]];
          cb(null, friendProfile);
        }
        else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options[f.id], function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      }, ////////////////////////////////////////////////////////////////////////
      function(friendProfile, cb) { ////////////////////// Получаем историю
        var selfProfile = userList[socket.id];

        if(selfProfile.getID() == options[f.id]) {
          return cb(new Error("Попытка получить историю от себя"));
        }

        if(selfProfile.isPrivateChat(friendProfile.getID())) {
          selfProfile.getHistory(options, function(err, history) {
            if(err) { return cb(err, null); }

            history = history || [];
            history.sort(compareDates);

            var i;
            for(i = 0; i < history.length; i++) {
              sendOne(socket, history[i]);
            }
          });
          cb(null, null);
        } else {
          return cb(new Error("Чат с этим пользователем не открыт"));
        }
      }
    ], function(err, res) {
      if (err) { return new GameError(socket, constants.IO_GET_CHAT_HISTORY, err.message); }

    });
  });
};

// Для сортировки массива сообщений (получение топа по дате)
function compareDates(mesA, mesB) {
  return mesA.date - mesB.date;
}
