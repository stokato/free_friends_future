var async     =  require('async');

// Свои модули
var constants       = require('./../../../constants'),
    openPrivateChat = require('./open_private_chat'),
    getUserProfile  = require('./../common/get_user_profile'),
    sendInRoom      = require('./../common/send_in_room'),
    sendOne         = require('./../common/send_one');

var cdb = require('./../../../db/lib/common/cassandra_db');

var oPool = require('./../../../objects_pool');


/*
 Отправить личное сообщение: Сообщение, объект с инф. о получателе (VID, еще что то?)
 - Получаем свой профиль
 - Получаем профиль адресата (из ОЗУ или БД)
 - Сохраняем адресату сообщение
 - Сохраняем сообщение себе                                       ???
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket, options, callback) {

    var selfProfile = oPool.userList[socket.id];

    if (selfProfile.getID() == options.id) {
      return callback(constants.errors.SELF_ILLEGAL);
    }

    var isChat = options.id || false;

    var date = new Date();

    var info = {};
    info.id      = selfProfile.getID();
    info.vid     = selfProfile.getVID();
    info.age     = selfProfile.getAge();
    info.sex     = selfProfile.getSex();
    info.city    = selfProfile.getCity();
    info.country = selfProfile.getCountry();
    info.text    = options.text;
    info.date    = date;

    if(!isChat) {
      var currRoom = oPool.roomList[socket.id];

      info.messageid = cdb.timeUuid.fromDate(date);

      sendInRoom(socket, currRoom, info);
      
      callback(null, null);
    }


    async.waterfall([//////////////////////////////////////////////////////////////
      function (cb) { // Получаем данные адресата и готовим сообщение к добавлению в историю
        
        getUserProfile(options.id, cb);

      }, ///////////////////////////////////////////////////////////////////////////////
      function(friendProfile, cb) { // Открываем чат, если еще не открыт
        if(!selfProfile.isPrivateChat(friendProfile.getID())) {
          
          openPrivateChat(socket, {id : friendProfile.getID() }, function (err) {
            if(err) { cb(err); }
  
            // Если собеседник онлайн и у него не открыт чат с нами
            if (oPool.profiles[options.id] && !friendProfile.isPrivateChat(selfProfile.getID())) {
              
              openPrivateChat(friendProfile.getSocket(), { id : selfProfile.getID() }, function (err) {
                if(err) { cb(err); }
                
                cb(null, friendProfile);
              })
              
            } else {
              cb(null, friendProfile);
            }
          });
          
        } else {
          cb(null, friendProfile);
        }
      },//////////////////////////////////////////////////////////////////////
      function (friendProfile, cb) { // Сохраняем сообщение в историю получателя
        var date = new Date();
        var savingMessage = {};
        savingMessage.date         = date;
        savingMessage.companionid  = selfProfile.getID();
        savingMessage.companionvid = selfProfile.getVID();
        savingMessage.incoming     = true;
        savingMessage.text         = options.text;

        friendProfile.addMessage(savingMessage, function (err, message) {
          if (err) { return cb(err, null); }

          if (oPool.profiles[options.id]) {
            var friendSocket = friendProfile.getSocket();

            if(friendProfile.isPrivateChat(selfProfile.getID())) {
              info.chat = selfProfile.getID();
              info.chatVID = selfProfile.getVID();
              info.messageid = message.messageid;
              sendOne(friendSocket, info);
            } else {
              friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
            }
          }
          cb(null, savingMessage, friendProfile, date);
        });
      }, //////////////////////////////////////////////////////////////////////////////////////
      function (savingMessage, friendProfile, date, cb) { // Сохраняем сообщение в историю отправителя

        savingMessage.date         = date;
        savingMessage.companionid  = friendProfile.getID();
        savingMessage.companionvid = friendProfile.getVID();
        savingMessage.incoming     = false;
        //savingMessage[f.text]         = options[f.text];

        selfProfile.addMessage(savingMessage, function (err, message) {
          if (err) { cb(err, null); }

          info.chat = friendProfile.getID();
          info.chatVID = friendProfile.getVID();
          info.messageid = message.messageid;
          sendOne(socket, info);

          cb(null, null);
        });
      }/////////////////////////////////////////////////////////////////////////////////
    ], function (err) { // Вызывается последней или в случае ошибки
      if (err) { return callback(err); }
      
      callback(null, null);
    });

};


