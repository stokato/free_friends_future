var async         = require('async');

var constants       = require('./../../../constants'),
  getUserProfile  = require('./../common/get_user_profile'),
  sendOne         = require('./../common/send_one');

var oPool = require('./../../../objects_pool');

module.exports = function(socket, options, callback) {
  
  async.waterfall([ ///////////////////////////////////////////////////////////////////
    function(cb) {
      
      getUserProfile(options.id, cb);
      
    }, ////////////////////////////////////////////////////////////////////////
    function(friendProfile, cb) { // Получаем историю
      var selfProfile = oPool.userList[socket.id];
      
      if(selfProfile.getID() == options.id) {
        return cb(constants.errors.SELF_ILLEGAL);
      }
      
      if(selfProfile.isPrivateChat(friendProfile.getID())) {
        selfProfile.getHistory(options, function(err, history) {
          if(err) { return cb(err, null); }
          
          history = history || [];
          history.sort(function (mesA, mesB) {
            return mesA.date - mesB.date;
          });
          
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
    if (err) { return callback(err); }
    
    callback(null, null);
  });
  
};

