/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Блокируем получение сообщений от пользователя
 */

var async = require('async');

var constants  = require('./../../../constants'),
  PF         = constants.PFIELDS,
  getUserProfile  = require('./../common/get_user_profile'),
  oPool      = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    callback(constants.errors.SELF_ILLEGAL);
  }
  
  var date = new Date();
  
  async.waterfall([//-----------------------------------------------------
      function (cb) { // Получаем профиль блокируемого пользователя
        
        getUserProfile(options[PF.ID], cb);
        
      },//-----------------------------------------------------
      function (friendProfile, cb) { // Добавляем в черный список
        
        selfProfile.addToBlackList(friendProfile, date, function (err) {
          if (err) { return cb(err, null); }
          
          cb(null, null);
        })
        
      }], //-----------------------------------------------------
    function (err) { // Проверяем на ошибки
      if (err) { return callback(err); }
      
      callback(null, null);
    }); // waterfall
  
};





