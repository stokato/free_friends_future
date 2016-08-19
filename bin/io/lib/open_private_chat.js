var async           = require('async');
var profilejs       = require('../../profile/index'),
  GameError       = require('../../game_error'),
  checkInput      = require('../../check_input'),
  genDateHistory  = require('./gen_date_history'),
  sendOne         = require('./send_one'),
  //sanitize        = require('../../sanitizer'),
  constants       = require('./../../constants');

var oPool = require('./../../objects_pool');

module.exports = function(socket) {
  socket.on(constants.IO_OPEN_PRIVATE_CHAT, function(options) {
    if (!checkInput(constants.IO_OPEN_PRIVATE_CHAT, socket, oPool.userList, options)) { return; }

    //options.id = sanitize(options.id);

    async.waterfall([ ///////////////////////////////////////////////////////////////////
      function(cb) {

        var friendProfile;
        if (oPool.profiles[options.id]) {             // Если онлайн
          friendProfile = oPool.profiles[options.id];
          cb(null, friendProfile);

        } else {                                // Если нет - берем из базы
          friendProfile = new profilejs();      // Нужен VID и все поля, как при подключении
          friendProfile.build(options.id, function (err, info) {
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });
        }

      }, ///////////////////////////////////////////////////////////////////////////
      function(friendProfile, cb) { // Отрываем чат для одного и отправляем ему историю
        var selfProfile = oPool.userList[socket.id];

        if(selfProfile.getID() == options.id) {
          return cb(constants.errors.SELF_ILLEGAL);
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

          cb(null, null);
        });
      } ///////////////////////////////////////////////////////
    ], function(err, res) {
      if (err) { return handError(err); }

      socket.emit(constants.IO_OPEN_PRIVATE_CHAT, { operation_status : constants.RS_GOODSTATUS });
    });


    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_OPEN_PRIVATE_CHAT, res);

      new GameError(socket, constants.IO_OPEN_PRIVATE_CHAT, err.message || constants.errors.OTHER.message);
    }

    // Для сортировки массива сообщений (получение топа по дате)
    function compareDates(mesA, mesB) {
      return mesA.date - mesB.date;
    }
  });
};


