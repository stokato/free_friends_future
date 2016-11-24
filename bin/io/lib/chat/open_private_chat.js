var async           = require('async');

var constants       = require('./../../../constants'),
  PF                = constants.PFIELDS,
  getUserProfile    = require('./../common/get_user_profile'),
  genDateHistory    = require('./../common/gen_date_history'),
  sendOne           = require('./../common/send_one');

var oPool = require('./../../../objects_pool');

module.exports = function(socket, options, callback) {
  
  async.waterfall([ //--------------------------------------------------
    function(cb) {
      
      getUserProfile(options[PF.ID], cb);
      
    }, //---------------------------------------------------------------
    function(friendProfile, cb) { // Отрываем чат для одного и отправляем ему историю
      var selfProfile = oPool.userList[socket.id];
      
      if(selfProfile.getID() == options[PF.ID]) {
        return cb(constants.errors.SELF_ILLEGAL);
      }
      
      var secondDate = new Date();
      var firstDate = genDateHistory(secondDate);
      
      selfProfile.addPrivateChat(friendProfile, firstDate, secondDate);
      
      selfProfile.getHistory(friendProfile.getID(), firstDate, secondDate, function(err, history) {
        history = history || [];
        
        if(err) { return cb(err, null); }
        
        for(var i = 0; i < history.length; i++) {
          sendOne(socket, history[i]);
        }
        
        cb(null, null);
      });
    } //---------------------------------------------------------------
  ], function(err) {
    if (err) { return callback(err); }
    
    callback(null, null);
  });
  
};


