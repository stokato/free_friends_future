/**
 * Отправляем сообщение в комнату, либо в приватный чат
 *
 * @param socket, options - объект с ид адресата и текстом сообщения, callback
 *
 */

var async         = require('async');

// Свои модули
var constants     = require('./../../../constants'),
  PF              = constants.PFIELDS,
  openPrivateChat = require('./open_private_chat'),
  getUserProfile  = require('./../common/get_user_profile'),
  sendInRoom      = require('./../common/send_in_room'),
  sendOne         = require('./../common/send_one'),
  cdb             = require('./../../../db/lib/common/cassandra_db'),
  oPool           = require('./../../../objects_pool');


module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    return callback(constants.errors.SELF_ILLEGAL);
  }
  
  var isPrivate = options[PF.ID] || false;
  var date = new Date();
  
  var info = {};
  info[PF.ID]       = selfProfile.getID();
  info[PF.VID]      = selfProfile.getVID();
  info[PF.AGE]      = selfProfile.getAge();
  info[PF.SEX]      = selfProfile.getSex();
  info[PF.CITY]     = selfProfile.getCity();
  info[PF.COUNTRY]  = selfProfile.getCountry();
  info[PF.TEXT]     = options[PF.TEXT];
  info[PF.DATE]     = date;
  
  // Если сообщение не приватное, шлем в комнату и все
  if(!isPrivate) {
    var currRoom = oPool.roomList[socket.id];
    
    info[PF.MESSAGEID] = cdb.timeUuid.fromDate(date);
    
    sendInRoom(socket, currRoom, info);
    
    return callback(null, null);
  }
    
  async.waterfall([//--------------------------------------------------------------------------
    function (cb) { // Получаем профиль адресата
      
      getUserProfile(options[PF.ID], cb);
      
    }, //--------------------------------------------------------------------------
    function (friendProfile, cb) { // Если пользователь в черном списке, сообщаяем ему
      if(friendProfile.isInBlackList(selfProfile.getID())) {
        
        var params = {};
        params[PF.ID] = friendProfile.getID();
        params[PF.VID] = friendProfile.getVID();
        
        socket.emit(constants.IO_BLOCK_USER_NOTIFY, params);
        
        cb(null, true, friendProfile);
      } else cb(null, false, friendProfile);
    },//--------------------------------------------------------------------------
    function(isBanned, friendProfile, cb) { // Открываем чат отправителю, если еще не открыт
      if(isBanned) { return cb(null, isBanned, friendProfile); };
      
      if(!selfProfile.isPrivateChat(friendProfile.getID())) {
        
        var params = {};
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
        
        var params = {};
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
          var friendSocket = friendProfile.getSocket();
          
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
    if (err) { return callback(err); }
    
    callback(null, null);
  });
};


