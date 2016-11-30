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
    function(friendProfile, cb) { // Открываем чат с адресатом, если еще не открыт
      if(!selfProfile.isPrivateChat(friendProfile.getID())) {
        
        var params = {};
        params[PF.ID] = friendProfile.getID();
        
        openPrivateChat(socket, params, function (err) {
          if(err) { cb(err); }
          
          cb(null, friendProfile);
        });
        
      } else {
        cb(null, friendProfile);
      }
    },//--------------------------------------------------------------------------
    function(friendProfile, cb) { // Если собеседник онлайн и у него не открыт чат с нами - открываем
      
      if (oPool.profiles[options[PF.ID]] && !friendProfile.isPrivateChat(selfProfile.getID())) {
        
        var params = {};
        params[PF.ID] = selfProfile.getID();
        
        openPrivateChat(friendProfile.getSocket(), params, function (err) {
          if(err) { cb(err); }
          
          cb(null, friendProfile);
        })
        
      } else {
        cb(null, friendProfile);
      }
    },//--------------------------------------------------------------------------
    function (friendProfile, cb) { // Сохраняем сообщение в историю получателя
      
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
        cb(null, friendProfile);
      });
    }, //--------------------------------------------------------------------------
    function (friendProfile, cb) { // Сохраняем сообщение в историю отправителя
      
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


