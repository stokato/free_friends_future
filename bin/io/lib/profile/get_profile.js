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
const PF              = require('./../../../const_fields');
const oPool           = require('./../../../objects_pool');

const getUserProfile  = require('./../common/get_user_profile');
const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitize');

module.exports = function (socket, options) {
  
  const IO_GET_PROFILE = Config.io.emits.IO_GET_PROFILE;
  
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_GET_PROFILE);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  selfProfile.setActivity();

  let selfInfoObj = {
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
        selfProfile.getPrivateChats((err, chatsInfo) => { chatsInfo = chatsInfo || {};
          if (err) {
            return cb(err, null);
          }
          
          selfInfoObj[PF.CHATS]        = chatsInfo[PF.CHATS];
          selfInfoObj[PF.NEWMESSAGES]  = chatsInfo[PF.NEWCHATS] || 0;
          
          cb(null, null);
        });
      }, //----------------------------------------------------------------------
      function (res, cb) { // Получаем подарки
        selfProfile.getGifts(true, (err, giftsInfo) => { giftsInfo = giftsInfo || {};
          if (err) {
            return cb(err, null);
          }
          
          selfInfoObj[PF.GIFTS]    = giftsInfo[PF.GIFTS];
          selfInfoObj[PF.NEWGIFTS] = giftsInfo[PF.NEWGIFTS] || 0;
          cb(null, null);
        });
      },//----------------------------------------------------------------------
      function (res, cb) { // Получаем друзей
        selfProfile.getFriends(true, (err, friendsInfo) => { friendsInfo = friendsInfo || {};
          if (err) {
            return cb(err, null);
          }
          
          selfInfoObj[PF.FRIENDS]    = friendsInfo[PF.FRIENDS];
          selfInfoObj[PF.NEWFRIENDS] = friendsInfo[PF.NEWFRIENDS] || 0;
          cb(null, null);
        });
      },//----------------------------------------------------------------------
      function (res, cb) { // Получаем гостей
        selfProfile.getGuests(true, (err, guestsInfo) => { guestsInfo = guestsInfo || {};
          if (err) {
            return cb(err, null);
          }
          
          selfInfoObj[PF.GUESTS]    = guestsInfo[PF.GUESTS];
          selfInfoObj[PF.NEWGUESTS] = guestsInfo[PF.NEWGUESTS] || 0;
          cb(null, null);
        });
      },//----------------------------------------------------------------------
      function (res, cb) { // Получаем статистику
        selfProfile.getStat((err, st) => {
          if (err) {
            return cb(err, null);
          }
      
          selfInfoObj[PF.STAT]    = st || null;
          
          cb(null, null);
        });
      }//----------------------------------------------------------------------
    ], function(err) { // Отправляем сведения
      if (err) {
        return emitRes(err, socket, IO_GET_PROFILE);
      }
      
      emitRes(null, socket, IO_GET_PROFILE, selfInfoObj);
    });
    
  } else {
    async.waterfall([//----------------------------------------------------------------------
      function (cb) { // Получаем профиль того, чей просматриваем
        
        getUserProfile(options[PF.ID], (err, friendProfile) => {
          if(err) { return cb(err); }
  
          let friendInfoObj = {
            [PF.ID]       : friendProfile.getID(),
            [PF.VID]      : friendProfile.getVID(),
            [PF.AGE]      : friendProfile.getAge(),
            [PF.SEX]      : friendProfile.getSex(),
            [PF.CITY]     : friendProfile.getCity(),
            [PF.COUNTRY]  : friendProfile.getCountry(),
            [PF.STATUS]   : friendProfile.getStatus(),
            [PF.POINTS]   : friendProfile.getPoints()
          };
          
          cb(null, friendProfile, friendInfoObj);
        });
        
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfoObj, cb) { // Получаем подарки
        friendProfile.getGifts(false, (err, giftsInfo) => { giftsInfo = giftsInfo || {};
          if (err) {
            return cb(err, null);
          }
          
          
          friendInfoObj[PF.GIFTS] = giftsInfo[PF.GIFTS];
          
          cb(null, friendProfile, friendInfoObj);
        });
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfoObj, cb) { // Проверяем, наш ли это друг
        friendProfile.isFriend([selfProfile.getID()], (err, res) => {
          if (err) {
            return cb(err, null);
          }
          
          friendInfoObj[PF.ISFRIEND] = res[0][PF.ISFRIEND];
          
          cb(null, friendProfile, friendInfoObj);
        });
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfoObj, cb) { // Получаем друзей
        friendProfile.getFriends(false, (err, friendsInfo) => { friendsInfo = friendsInfo || {};
          if (err) {
            return cb(err, null);
          }
          
          friendInfoObj[PF.FRIENDS] = friendsInfo[PF.FRIENDS];
          
          cb(null, friendProfile, friendInfoObj);
        });
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfoObj, cb) { // Добавляем себя в гости
        let date = new Date();
        
        friendProfile.addToGuests(selfProfile, date, (err) => {
          if (err) {
            return cb(err, null);
          }
          
          cb(null, friendProfile, friendInfoObj);
        });
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfoObj, cb) { // Получаем гостей
        friendProfile.getGuests(false, (err, guestsInfo) => { guestsInfo = guestsInfo || {};
          if (err) {
            return cb(err, null);
          }
          
          friendInfoObj[PF.GUESTS] = guestsInfo[PF.GUESTS];
          
          cb(null, friendProfile, friendInfoObj);
        });
      },//----------------------------------------------------------------------
      function (friendProfile, friendInfoObj, cb) { // Получаем статистику TODO: Возможно понадобиться ограничить
        friendProfile.getStat((err, st) => {
          if (err) {
            return cb(err, null);
          }
  
          friendInfoObj[PF.STAT]    = st || null;
      
          cb(null, friendProfile, friendInfoObj);
        });
      }//----------------------------------------------------------------------
    ], function (err, friendProfile, friendInfoObj) { // Отправляем сведения
      if (err) {
        return emitRes(err, socket, IO_GET_PROFILE);
      }
      
      if (oPool.isProfile(friendProfile.getID())) { // Если тот, кого просматирваем, онлайн, сообщаем о госте
        
        let friendSocket = friendProfile.getSocket();
        
        friendSocket.emit(Config.io.emits.IO_ADD_GUEST, selfInfoObj);
      }
  
      emitRes(null, socket, IO_GET_PROFILE, friendInfoObj);
    }); // waterfall
  }
  
};


