var async     =  require('async');

// Свои модули
var constants       = require('./../../constants'),
    profilejs       = require('../../profile/index'), // Профиль
    GameError       = require('../../game_error'),
    //sanitize        = require('../../sanitizer'),
    checkInput      = require('../../check_input'),
    sendInRoom      = require('./send_in_room'),
    sendOne         = require('./send_one'),
    genDateHistory  = require('./gen_date_history');

var cdb = require('./../../cassandra_db');

var oPool = require('./../../objects_pool');


/*
 Отправить личное сообщение: Сообщение, объект с инф. о получателе (VID, еще что то?)
 - Получаем свой профиль
 - Получаем профиль адресата (из ОЗУ или БД)
 - Сохраняем адресату сообщение
 - Сохраняем сообщение себе                                       ???
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket) {
  socket.on(constants.IO_MESSAGE, function(options) {
    if (!checkInput(constants.IO_MESSAGE, socket,  options)) { return; }

    //var f = constants.FIELDS;
    var selfProfile = oPool.userList[socket.id];

    if (selfProfile.getID() == options.id) {
      return handError(constants.errors.SELF_ILLEGAL);
    }

    //var text = sanitize(options.text);

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

      return sendInRoom(socket, currRoom, info);
    }

    //options.id = sanitize(options.id);

    if (!checkInput(constants.IO_PRIVATE_MESSAGE, socket, options)){ return; }

    async.waterfall([//////////////////////////////////////////////////////////////
      function (cb) { // Получаем данные адресата и готовим сообщение к добавлению в историю
        var friendProfile = null;

        if (oPool.profiles[options.id]) { // Если онлайн
          friendProfile = oPool.profiles[options.id];
          cb(null, friendProfile);

        } else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      }, ///////////////////////////////////////////////////////////////////////////////
      function(friendProfile, cb) { // Открываем чат, если еще не открыт
        var chat = null, firstDate = genDateHistory(new Date());
        if(!selfProfile.isPrivateChat(friendProfile.getID())) {
          chat = fillInfo(friendProfile);

          selfProfile.addPrivateChat(chat);

          chat.date = firstDate;
          selfProfile.getHistory(chat, function (err, history) {
            if (err) { return cb(err, null); }

            history = history || [];
            history.sort(compareDates);

            for (var i = 0; i < history.length; i++) {
              sendOne(socket, history[i]);
            }
          });
        } // Если собеседник онлайн и у него не открыт чат с нами
        if (oPool.profiles[options.id] && !friendProfile.isPrivateChat(selfProfile.getID())) {
          chat = fillInfo(selfProfile);

          friendProfile.addPrivateChat(chat);

          chat.date = firstDate;
          friendProfile.getHistory(chat, function (err, history) {
            if (err) { cb(err, null); }

            history = history || [];
            history.sort(compareDates);

            var friendSocket = friendProfile.getSocket();

            for(var i = 0; i < history.length; i++) {
              sendOne(friendSocket, history[i]);
            }
          });
        }
        cb(null, friendProfile);
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
      if (err) { return handError(err); }
    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_CHANGE_STATUS, res);

      new GameError(socket, constants.IO_CHANGE_STATUS, err.message || constants.errors.OTHER.message);
    }

    // Для сортировки массива сообщений (получение топа по дате)
    function compareDates(mesA, mesB) {
      return mesA.date - mesB.date;
    }

    function fillInfo(profile) {
      //var f = constants.FIELDS;
      var info = {};
      info.id      = profile.getID();
      info.vid     = profile.getVID();
      info.age     = profile.getAge();
      info.sex     = profile.getSex();
      info.city    = profile.getCity();
      info.country = profile.getCountry();
      info.points  = profile.getPoints();

      return info;
    }
  });
};


