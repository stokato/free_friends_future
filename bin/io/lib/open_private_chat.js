var async         = require('async');
var profilejs     =  require('../../profile/index'),
    GameError       = require('../../game_error'),
    checkInput      = require('../../check_input'),
    genDateHistory  = require('./gen_date_history'),
    sendOne         = require('./send_one');

module.exports = function(socket, userList, profiles) {
  socket.on('open_private_chat', function(options) {
    if (!checkInput('open_private_chat', socket, userList, options)) {
      return new GameError(socket, "OPENPRIVCHAT", "Верификация не пройдена");
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
      },
      function(compProfile, cb) { ////////////////////// Отрываем чат для одного и отправляем ему историю
        var selfProfile = userList[socket.id];

        if(selfProfile.getID() == options.id) {
          return cb(new Error("Попытка открыть чат с самим сабой"))
        }

        if(!selfProfile.isPrivateChat(compProfile.getID())) {
          var secondDate = new Date();
          var firstDate = genDateHistory(secondDate);
          var chat = {
            id      : compProfile.getID(),
            vid     : compProfile.getVID(),
            fdate   : firstDate,
            sdate   : secondDate,
            age     : compProfile.getAge(), //
            city    : compProfile.getCity(),
            country : compProfile.getCountry(),
            sex     : compProfile.getSex()
          };
          selfProfile.addPrivateChat(chat, function(err, history) {
            if(err) { return cb(err, null); }

            history = history || [];
            history.sort(compareDates);

            for(var i = 0; i < history.length; i++) {
              sendOne(socket, history[i]);
            }
        });
          cb(null, null);
        }
      }
    ], function(err, res) {
      if (err) { return new GameError(socket, "OPENPRIVCHAT", err.message); }

    });
  });
};

// Для сортировки массива сообщений (получение топа по дате)
function compareDates(mesA, mesB) {
  return mesA.date - mesB.date;
}
