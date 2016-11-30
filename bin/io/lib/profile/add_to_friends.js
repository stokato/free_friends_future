/**
 * Добавляем пользователя в друзья
 *
 * @param socket, options - объект с ид нового друга, callback
 * @return {Object} - сведения о новом друге
 */

var async =  require('async');

var constants       = require('./../../../constants'),
    PF              = constants.PFIELDS,
    getUserProfile  = require('./../common/get_user_profile'),
    oPool           = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
    
    var selfProfile = oPool.userList[socket.id];
    
    if (selfProfile.getID() == options[PF.ID]) {
      callback(constants.errors.SELF_ILLEGAL);
    }
    
    var date = new Date();
    
    async.waterfall([//-----------------------------------------------------
      function (cb) { // Получаем профиль друга
        
        getUserProfile(options[PF.ID], cb);
        
      },//-----------------------------------------------------
      function (friendProfile, cb) { // Добавляем первому друго
        
        selfProfile.addToFriends(friendProfile, date, function (err) {
          if (err) { return cb(err, null); }
    
          cb(null, selfProfile, friendProfile, date);
        })

      },//-----------------------------------------------------
      function (selfProfile, friendProfile, date, cb) { // И второму
  
        friendProfile.addToFriends(selfProfile, date, function (err) {
          if (err) { return cb(err, null); }
    
          cb(null, friendProfile, selfProfile, date);
        })
        
      }], //-----------------------------------------------------
      function (err, friendProfile) { // Отправляем сведения о новом друге
        if (err) { return callback(err); }
      
        var friendInfo = fillInfo(friendProfile, date);
        
        if (oPool.isProfile(friendProfile.getID())) { // Если друг онлайн, то и ему
          var selfInfo = fillInfo(selfProfile, date);
          
          var friendSocket = friendProfile.getSocket();
          friendSocket.emit(constants.IO_NEW_FRIEND, selfInfo);
        }
        
        callback(null, friendInfo);
    }); // waterfall
    
    //--------------
    function fillInfo(profile, date) {
      
      var res = {};
      res[PF.ID]      = profile.getID();
      res[PF.VID]     = profile.getVID();
      res[PF.DATE]    = date;
      res[PF.POINTS]  = profile.getPoints();
      res[PF.AGE]     = profile.getAge();
      res[PF.CITY]    = profile.getCity();
      res[PF.COUNTRY] = profile.getCountry();
      res[PF.SEX]     = profile.getSex();
      
      return res;
    }

};




