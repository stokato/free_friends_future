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

const async  =  require('async');

const Config          = require('./../../../../config.json');
const oPool           = require('./../../../objects_pool');

const getUserProfile  = require('./../common/get_user_profile');
const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitize');

const PF              = require('./../../../const_fields');
const IO_GET_PROFILE = Config.io.emits.IO_GET_PROFILE;

module.exports = function (socket, options) {
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_GET_PROFILE);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];

  let selfInfo = {
    [PF.ID]       : selfProfile.getID(),
    [PF.VID]      : selfProfile.getVID(),
    [PF.AGE]      : selfProfile.getAge(),
    [PF.SEX]      : selfProfile.getSex(),
    [PF.CITY]     : selfProfile.getCity(),
    [PF.COUNTRY]  : selfProfile.getCountry(),
    [PF.STATUS]   : selfProfile.getStatus(),
    [PF.POINTS]   : selfProfile.getPoints()
  };

  
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
      },//----------------------------------------------------------------------
      function (res, cb) { // Получаем статистику
        selfProfile.getStat(function (err, st) {
          if (err) { return cb(err, null); }
      
          selfInfo[PF.STAT]    = st || null;
          
          cb(null, null);
        });
      }//----------------------------------------------------------------------
    ], function(err) { // Отправляем сведения
      if (err) { return emitRes(err, socket, IO_GET_PROFILE); }
      
      emitRes(null, socket, IO_GET_PROFILE, selfInfo);
    });
    
  } else {
    async.waterfall([//----------------------------------------------------------------------
      function (cb) { // Получаем профиль того, чей просматриваем
        
        getUserProfile(options[PF.ID], function (err, friendProfile) {
          if(err) { return cb(err); }
  
          let friendInfo = {
            [PF.ID]       : friendProfile.getID(),
            [PF.VID]      : friendProfile.getVID(),
            [PF.AGE]      : friendProfile.getAge(),
            [PF.SEX]      : friendProfile.getSex(),
            [PF.CITY]     : friendProfile.getCity(),
            [PF.COUNTRY]  : friendProfile.getCountry(),
            [PF.STATUS]   : friendProfile.getStatus(),
            [PF.POINTS]   : friendProfile.getPoints()
          };
          
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
        let date = new Date();
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
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfo, cb) { // Получаем статистику TODO: Возможно понадобиться ограничить
        friendProfile.getStat(function (err, st) {
          if (err) { return cb(err, null); }
  
          friendInfo[PF.STAT]    = st || null;
      
          cb(null, friendProfile, friendInfo);
        });
      }//----------------------------------------------------------------------
    ], function (err, friendProfile, friendInfo) { // Отправляем сведения
      if (err) { return emitRes(err, socket, IO_GET_PROFILE); }
      
      if (oPool.isProfile(friendProfile.getID())) { // Если тот, кого просматирваем, онлайн, сообщаем о госте
        
        let friendSocket = friendProfile.getSocket();
        
        friendSocket.emit(Config.io.emits.IO_ADD_GUEST, selfInfo);
      }
  
      emitRes(null, socket, IO_GET_PROFILE, friendInfo);
    }); // waterfall
  }
  
};


