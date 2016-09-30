var async           = require('async');

var constants       = require('./../../../constants'),
  getUserProfile    = require('./../common/get_user_profile'),
  genDateHistory    = require('./../common/gen_date_history'),
  sendOne           = require('./../common/send_one');

var oPool = require('./../../../objects_pool');

module.exports = function(socket, options, callback) {

    async.waterfall([ ///////////////////////////////////////////////////////////////////
      function(cb) {

        getUserProfile(options.id, cb);

      }, ///////////////////////////////////////////////////////////////////////////
      function(friendProfile, cb) { // Отрываем чат для одного и отправляем ему историю
        var selfProfile = oPool.userList[socket.id];

        if(selfProfile.getID() == options.id) {
          return cb(constants.errors.SELF_ILLEGAL);
        }
        
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
          history.sort(function (mesA, mesB) {
            return mesA.date - mesB.date;
          });

          for(var i = 0; i < history.length; i++) {
            sendOne(socket, history[i]);
          }

          cb(null, null);
        });
      } ///////////////////////////////////////////////////////
    ], function(err, res) {
      if (err) { return callback(err); }

      callback(null, null);
    });

};


