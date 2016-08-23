var async         = require('async');

var constants       = require('./../../constants'),
  profilejs     =  require('../../profile/index'),
  GameError       = require('../../game_error'),
  checkInput      = require('../../check_input'),
  sendOne         = require('./send_one');

var oPool = require('./../../objects_pool');

module.exports = function(socket) {
  socket.on(constants.IO_GET_CHAT_HISTORY, function(options) {
    if (!checkInput(constants.IO_GET_CHAT_HISTORY, socket, options)) { return; }

    //options.id = sanitize(options.id);

    async.waterfall([ ///////////////////////////////////////////////////////////////////
      function(cb) {

        var friendProfile;
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

      }, ////////////////////////////////////////////////////////////////////////
      function(friendProfile, cb) { ////////////////////// Получаем историю
        var selfProfile = oPool.userList[socket.id];

        if(selfProfile.getID() == options.id) {
          return handError(constants.errors.SELF_ILLEGAL);
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
      if (err) { return handError(options, err.message); }

      socket.emit(constants.IO_GET_CHAT_HISTORY, { operation_status : constants.RS_GOODSTATUS });

    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_GET_CHAT_HISTORY, res);

      new GameError(socket, constants.IO_GET_CHAT_HISTORY, err.message || constants.errors.OTHER.message);
    }
  });
};

// Для сортировки массива сообщений (получение топа по дате)
function compareDates(mesA, mesB) {
  return mesA.date - mesB.date;
}
