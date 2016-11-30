/**
 * Получаем историю сообщений по приватному чату
 *
 * @param socket, options - обект с ид пользователя, чат с которым нужно поулучить и временной период
 */

var async           = require('async');

var constants       = require('./../../../constants'),
  getUserProfile    = require('./../common/get_user_profile'),
  sendOne           = require('./../common/send_one'),
  oPool             = require('./../../../objects_pool');

module.exports = function(socket, options, callback) {
  
  async.waterfall([ //-----------------------------------------------------
    function(cb) { // Получаем профиль
      
      getUserProfile(options[constants.PFIELDS.ID], cb);
      
    }, //------------------------------------------------------------------
    function(friendProfile, cb) { // Получаем историю и отправляем отдельными сообщениями
      var selfProfile = oPool.userList[socket.id];
      
      if(selfProfile.getID() == options[constants.PFIELDS.ID]) {
        return cb(constants.errors.SELF_ILLEGAL);
      }
      
      if(selfProfile.isPrivateChat(friendProfile.getID())) {
        
        var id        = options[constants.PFIELDS.ID],
            dateFrom  = options[constants.PFIELDS.DATE_FROM],
            dateTo    = options[constants.PFIELDS.DATE_TO];
        
        selfProfile.getHistory(id, dateFrom, dateTo, function(err, history) {
          if(err) { return cb(err, null); }
          
          history = history || [];
          
          for(var i = 0; i < history.length; i++) {
            sendOne(socket, history[i]);
          }
        });
        cb(null, null);
      } else {
        return cb(new Error(constants.errors.NO_SUCH_CHAT));
      }
    } //------------------------------------------------------------------------
  ], function(err, res) {
    if (err) { return callback(err); }
    
    callback(null, null);
  });
  
};

