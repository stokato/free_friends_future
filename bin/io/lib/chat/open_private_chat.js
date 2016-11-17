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

        selfProfile.addPrivateChat(friendProfile, firstDate, secondDate);
        
        var params = {
          id : friendProfile.getID(),
          first_date : firstDate,
          second_date : secondDate
        };
        
        selfProfile.getHistory(params, function(err, history) { history = history || [];
          if(err) { return cb(err, null); }

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


