/**
 * Отправляем сообщение в комнату, либо в приватный чат
 *
 * @param socket, options - объект с ид адресата и текстом сообщения, callback
 *
 */

const async           = require('async');

const constants       = require('./../../../constants');
const oPool           = require('./../../../objects_pool');

const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitizer');
const openPrivateChat = require('./open_private_chat');
const getUserProfile  = require('./../common/get_user_profile');
const sendInRoom      = require('./../common/send_in_room');
const sendOne         = require('./../common/send_one');
const cdb             = require('./../../../db/lib/common/cassandra_db');

const PF              = constants.PFIELDS;

module.exports = function (socket, options) {
  if((PF.ID in options) && !checkID(options[PF.ID])) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_MESSAGE, null, true);
  }
  if(PF.ID in options) {
    options[PF.ID] = sanitize(options[PF.ID]);
  }
  
  options[PF.TEXT] = sanitize(options[PF.TEXT]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    return emitRes(constants.errors.SELF_ILLEGAL, socket, constants.IO_MESSAGE, null, true);
  }
  
  let isPrivate = options[PF.ID] || false;
  let date = new Date();
  
  let info = {
    [PF.ID]       : selfProfile.getID(),
    [PF.VID]      : selfProfile.getVID(),
    [PF.AGE]      : selfProfile.getAge(),
    [PF.SEX]      : selfProfile.getSex(),
    [PF.CITY]     : selfProfile.getCity(),
    [PF.COUNTRY]  : selfProfile.getCountry(),
    [PF.TEXT]     : options[PF.TEXT],
    [PF.DATE]     : date
  };

  
  // Если сообщение не приватное, шлем в комнату и все
  if(!isPrivate) {
    let currRoom = oPool.roomList[socket.id];
    
    info[PF.MESSAGEID] = cdb.timeUuid.fromDate(date);
    
    sendInRoom(socket, currRoom, info);
    
    return emitRes(null, socket, constants.IO_MESSAGE, null, true);
  }
    
  async.waterfall([//--------------------------------------------------------------------------
    function (cb) { // Получаем профиль адресата
      
      getUserProfile(options[PF.ID], cb);
      
    }, //--------------------------------------------------------------------------
    function (friendProfile, cb) { // Если пользователь в черном списке, сообщаяем ему
      if(friendProfile.isInBlackList(selfProfile.getID())) {
        
        let params = {};
        params[PF.ID] = friendProfile.getID();
        params[PF.VID] = friendProfile.getVID();
        
        socket.emit(constants.IO_BLOCK_USER_NOTIFY, params);
        
        cb(null, true, friendProfile);
      } else cb(null, false, friendProfile);
    },//--------------------------------------------------------------------------
    function(isBanned, friendProfile, cb) { // Открываем чат отправителю, если еще не открыт
      if(isBanned) { return cb(null, isBanned, friendProfile); }
      
      if(!selfProfile.isPrivateChat(friendProfile.getID())) {
        
        let params = {};
        params[PF.ID] = friendProfile.getID();
        
        openPrivateChat(socket, params, function (err) {
          if(err) { cb(err); }
          
          cb(null, isBanned, friendProfile);
        });
        
      } else {
        cb(null, isBanned, friendProfile);
      }
    },//--------------------------------------------------------------------------
    function(isBanned, friendProfile, cb) { // Если собеседник онлайн и у него не открыт чат с нами - открываем
      if(isBanned) { return cb(null, isBanned, friendProfile); }
      
      if (oPool.profiles[options[PF.ID]] && !friendProfile.isPrivateChat(selfProfile.getID())) {
        
        let params = {};
        params[PF.ID] = selfProfile.getID();
        
        openPrivateChat(friendProfile.getSocket(), params, function (err) {
          if(err) { cb(err); }
          
          cb(null, isBanned, friendProfile);
        })
        
      } else {
        cb(null, isBanned, friendProfile);
      }
    },//--------------------------------------------------------------------------
    function (isBanned, friendProfile, cb) { // Сохраняем сообщение в историю получателя
      if(isBanned) { return cb(null, isBanned, friendProfile); }
      
      friendProfile.addMessage(selfProfile, true, date, options[PF.TEXT], function (err, message) {
        if (err) { return cb(err, null); }
        
        if (oPool.profiles[options[PF.ID]]) {
          let friendSocket = friendProfile.getSocket();
          
          if(friendProfile.isPrivateChat(selfProfile.getID())) {
            
            info[PF.CHATID]     = selfProfile.getID();
            info[PF.CHATVID]    = selfProfile.getVID();
            info[PF.MESSAGEID]  = message[PF.MESSAGEID];
            
            sendOne(friendSocket, info);
          }
        }
        cb(null, isBanned, friendProfile);
      });
    }, //--------------------------------------------------------------------------
    function (isBanned, friendProfile, cb) { // Сохраняем сообщение в историю отправителя
      if(isBanned) { return cb(null, null); }
      
      selfProfile.addMessage(friendProfile, false, date, options.text, function (err, message) {
        if (err) { cb(err, null); }
        
        info[PF.CHATID]         = friendProfile.getID();
        info[PF.CHATVID]        = friendProfile.getVID();
        info[PF.MESSAGEID]      = message[PF.MESSAGEID];
        
        sendOne(socket, info);
        
        cb(null, null);
      });
    }//--------------------------------------------------------------------------
  ], function (err) { // Вызывается последней или в случае ошибки
    if (err) { return emitRes(err, socket, constants.IO_MESSAGE, null, true); }
    
    // emitRes(null, socket, constants.IO_MESSAGE);
  });
};


