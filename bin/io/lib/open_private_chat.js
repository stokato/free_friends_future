var async           = require('async');
var profilejs       = require('../../profile/index'),
    GameError       = require('../../game_error'),
    checkInput      = require('../../check_input'),
    genDateHistory  = require('./gen_date_history'),
    sendOne         = require('./send_one'),
    sanitize        = require('../../sanitizer'),
    constants       = require('./../constants');

module.exports = function(socket, userList, profiles) {
  socket.on(constants.IO_OPEN_PRIVATE_CHAT, function(options) {
    if (!checkInput(constants.IO_OPEN_PRIVATE_CHAT, socket, userList, options)) { return; }

    //var f = constants.FIELDS;

    options.id = sanitize(options.id);

    async.waterfall([ ///////////////////////////////////////////////////////////////////
      function(cb) {
        var friendProfile;
        if (profiles[options.id]) { // Если онлайн
          friendProfile = profiles[options.id];
          cb(null, friendProfile);
        }
        else {                // Если нет - берем из базы
          friendProfile = new profilejs(); // Нужен VID и все поля, как при подключении
          friendProfile.build(options.id, function (err, info) {
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      }, ///////////////////////////////////////////////////////////////////////////
      function(friendProfile, cb) { // Отрываем чат для одного и отправляем ему историю
        var selfProfile = userList[socket.id];

        if(selfProfile.getID() == options.id) {
          return cb(new Error("Попытка открыть чат с самим сабой"));
        }

        //if(!selfProfile.isPrivateChat(friendProfile.getID())) {
          var secondDate = new Date();
          var firstDate = genDateHistory(secondDate);
          var chat = {};
          chat.id          = friendProfile.getID();
          chat.vid         = friendProfile.getVID();
          chat.first_date  = firstDate;
          chat.second_date = secondDate;
          chat.age         = friendProfile.getAge();
          chat.city        = friendProfile.getCity();
          chat.country     = friendProfile.getCountry();
          chat.sex         = friendProfile.getSex();

          selfProfile.addPrivateChat(chat);
          selfProfile.getHistory(chat, function(err, history) {
            if(err) { return cb(err, null); }

            history = history || [];
            history.sort(compareDates);

            for(var i = 0; i < history.length; i++) {
              sendOne(socket, history[i]);
            }
        });
          cb(null, null);
        //} else {
        //  return cb(new Error("Чат с этим пользователем уже открыт"));
        //}
      }
    ], function(err, res) {
      if (err) { return new GameError(socket, constants.IO_OPEN_PRIVATE_CHAT, err.message); }

    });
  });
};

// Для сортировки массива сообщений (получение топа по дате)
function compareDates(mesA, mesB) {
  return mesA.date - mesB.date;
}
