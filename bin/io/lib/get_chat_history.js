var async         = require('async');
var profilejs     =  require('../../profile/index'),
  GameError       = require('../../game_error'),
  checkInput      = require('../../check_input'),
  sendOne         = require('./send_one');

module.exports = function(socket, userList, profiles) {
  socket.on('get_chat_history', function(options) {
    if (!checkInput('get_chat_history', socket, userList, options)) {
      return new GameError(socket, "GETCHATHISTORY", "Верификация не пройдена");
    }

    async.waterfall([ ///////////////////////////////////////////////////////////////////
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
      }, ////////////////////////////////////////////////////////////////////////
      function(compProfile, cb) { ////////////////////// Получаем историю
        var selfProfile = userList[socket.id];

        if(selfProfile.getID() == options.id) {
          return cb(new Error("Попытка получить историю от себя"));
        }

        if(selfProfile.isPrivateChat(compProfile.getID())) {
          selfProfile.getHistory(options, function(err, history) {
            if(err) { return cb(err, null); }

            history = history || [];
            history.sort(compareDates);

            for(var i = 0; i < history.length; i++) {
              sendOne(socket, history[i]);
            }
          });
          cb(null, null);
        } else {
          return cb(new Error("Чат с этим пользователем не открыт"));
        }
      }
    ], function(err, res) {
      if (err) { return new GameError(socket, "GETCHATHISTORY", err.message); }

    });
  });
};

// Для сортировки массива сообщений (получение топа по дате)
function compareDates(mesA, mesB) {
  return mesA.date - mesB.date;
}
