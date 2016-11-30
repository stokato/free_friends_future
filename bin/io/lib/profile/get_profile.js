/**
 * Получаем сведения о профиле, своем или другого пользователя
 *
 * @param socket, options - объект с ид пользователя, callback
 * @return {Object} - объект с данными о пользователе:
 *  - общие сведения
 *  - список чатов
 *  - список пользователей, даривших подарки с коллекциями подарков
 *  - список друзей
 *  - список гостей
 *  - количество чатов с новыми сообщениями, новых друзей, гостей, подарков
 */

var async     =  require('async');

var constants       = require('./../../../constants'),
    PF              = constants.PFIELDS,
    getUserProfile  = require('./../common/get_user_profile'),
    oPool           = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  var selfInfo = {};
  selfInfo[PF.ID]       = selfProfile.getID();
  selfInfo[PF.VID]      = selfProfile.getVID();
  selfInfo[PF.AGE]      = selfProfile.getAge();
  selfInfo[PF.SEX]      = selfProfile.getSex();
  selfInfo[PF.CITY]     = selfProfile.getCity();
  selfInfo[PF.COUNTRY]  = selfProfile.getCountry();
  selfInfo[PF.STATUS]   = selfProfile.getStatus();
  selfInfo[PF.POINTS]   = selfProfile.getPoints();
  
  // Если открываем свой профиль
  if (selfProfile.getID() == options[PF.ID]) {
    async.waterfall([//---------------------------------------------------------
      function (cb) { // Получаем историю чатов
        selfProfile.getPrivateChats(function (err, chatsInfo) { chatsInfo = chatsInfo || {};
          if (err) {  return cb(err, null); }
          
          selfInfo[PF.CHATS]        = chatsInfo[PF.CHATS];
          selfInfo[PF.NEWMESSAGES]  = chatsInfo[PF.NEWCHATS] || 0;
          
          cb(null, null);
        });
      }, //----------------------------------------------------------------------
      function (res, cb) { // Получаем подарки
        selfProfile.getGifts(true, function (err, giftsInfo) { giftsInfo = giftsInfo || {};
          if (err) {  return cb(err, null); }
          
          selfInfo[PF.GIFTS]    = giftsInfo[PF.GIFTS];
          selfInfo[PF.NEWGIFTS] = giftsInfo[PF.NEWGIFTS] || 0;
          cb(null, null);
        });
      },//----------------------------------------------------------------------
      function (res, cb) { // Получаем друзей
        selfProfile.getFriends(true, function (err, friendsInfo) { friendsInfo = friendsInfo || {};
          if (err) {  return cb(err, null); }
          
          selfInfo[PF.FRIENDS]    = friendsInfo[PF.FRIENDS];
          selfInfo[PF.NEWFRIENDS] = friendsInfo[PF.NEWFRIENDS] || 0;
          cb(null, null);
        });
      },//----------------------------------------------------------------------
      function (res, cb) { // Получаем гостей
        selfProfile.getGuests(true, function (err, guestsInfo) { guestsInfo = guestsInfo || {};
          if (err) { return cb(err, null); }
          
          selfInfo[PF.GUESTS]    = guestsInfo[PF.GUESTS];
          selfInfo[PF.NEWGUESTS] = guestsInfo[PF.NEWGUESTS] || 0;
          cb(null, null);
        });
      }//----------------------------------------------------------------------
    ], function(err) { // Отправляем сведения
      if (err) { return callback(err); }
      
      callback(null, selfInfo);
    });
    
  } else {
    async.waterfall([//----------------------------------------------------------------------
      function (cb) { // Получаем профиль того, чей просматриваем
        
        getUserProfile(options[PF.ID], function (err, friendProfile) {
          if(err) { return cb(err); }
          
          var friendInfo = {};
          friendInfo[PF.ID]       = friendProfile.getID();
          friendInfo[PF.VID]      = friendProfile.getVID();
          friendInfo[PF.AGE]      = friendProfile.getAge();
          friendInfo[PF.SEX]      = friendProfile.getSex();
          friendInfo[PF.CITY]     = friendProfile.getCity();
          friendInfo[PF.COUNTRY]  = friendProfile.getCountry();
          friendInfo[PF.STATUS]   = friendProfile.getStatus();
          friendInfo[PF.POINTS]   = friendProfile.getPoints();
          
          cb(null, friendProfile, friendInfo);
        });
        
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfo, cb) { // Получаем подарки
        friendProfile.getGifts(false, function (err, giftsInfo) { giftsInfo = giftsInfo || {};
          if (err) {  return cb(err, null); }
          
          
          friendInfo[PF.GIFTS] = giftsInfo[PF.GIFTS];
          cb(null, friendProfile, friendInfo);
        });
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfo, cb) { // Проверяем, наш ли это друг
        friendProfile.isFriend([selfProfile.getID()], function (err, res) {
          if (err) {  return cb(err, null); }
          
          friendInfo[PF.ISFRIEND] = res[0][PF.ISFRIEND];
          cb(null, friendProfile, friendInfo);
        });
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfo, cb) { // Получаем друзей
        friendProfile.getFriends(false, function (err, friendsInfo) { friendsInfo = friendsInfo || {};
          if (err) {  return cb(err, null); }
          
          friendInfo[PF.FRIENDS] = friendsInfo[PF.FRIENDS];
          cb(null, friendProfile, friendInfo);
        });
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfo, cb) { // Добавляем себя в гости
        var date = new Date();
        friendProfile.addToGuests(selfProfile, date, function (err) {
          if (err) { return cb(err, null); }
          
          cb(null, friendProfile, friendInfo);
        });
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfo, cb) { // Получаем гостей
        friendProfile.getGuests(false, function (err, guestsInfo) { guestsInfo = guestsInfo || {};
          if (err) { return cb(err, null); }
          
          friendInfo[PF.GUESTS] = guestsInfo[PF.GUESTS];
          cb(null, friendProfile, friendInfo);
        });
      }//----------------------------------------------------------------------
    ], function (err, friendProfile, friendInfo) { // Отправляем сведения
      if (err) { return callback(err); }
      
      if (oPool.isProfile(friendProfile.getID())) { // Если тот, кого просматирваем, онлайн, сообщаем о госте
        
        var friendSocket = friendProfile.getSocket();
        
        friendSocket.emit(constants.IO_ADD_GUEST, selfInfo);
      }
      
      callback(null, friendInfo);
    }); // waterfall
  }
  
};


