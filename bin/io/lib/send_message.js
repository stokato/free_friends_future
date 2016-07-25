var async     =  require('async');

// Свои модули
var profilejs       = require('../../profile/index'), // Профиль
    GameError       = require('../../game_error'),
    sanitize        = require('../../sanitizer'),
    checkInput      = require('../../check_input'),
    sendInRoom      = require('./send_in_room'),
    sendOne         = require('./send_one'),
    genDateHistory  = require('./gen_date_history'),
    constants       = require('./../constants');

var cassandra = require('cassandra-driver');
var TimeUuid = cassandra.types.TimeUuid; // Генератор id для Cassandra

/*
 Отправить личное сообщение: Сообщение, объект с инф. о получателе (VID, еще что то?)
 - Получаем свой профиль
 - Получаем профиль адресата (из ОЗУ или БД)
 - Сохраняем адресату сообщение
 - Сохраняем сообщение себе                                       ???
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket, userList, profiles, roomList) {
  socket.on(constants.IO_MESSAGE, function(options) {
    if (!checkInput(constants.IO_MESSAGE, socket, userList, options)) { return; }

    var f = constants.FIELDS;
    var selfProfile = userList[socket.id];
    if (selfProfile.getID() == options[f.id]) {
      return new GameError(socket, constants.IO_MESSAGE, "Нельзя отправлять сообщения себе");
    }

    var text = sanitize(options[f.text]);

    var isChat = options[f.id] || false;

    var date = new Date();

    var info = {};
    info[f.id]      = selfProfile.getID();
    info[f.vid]     = selfProfile.getVID();
    info[f.age]     = selfProfile.getAge();
    info[f.sex]     = selfProfile.getSex();
    info[f.city]    = selfProfile.getCity();
    info[f.country] = selfProfile.getCountry();
    info[f.text]    = text;
    info[f.date]    = date;

    if(!isChat) {
      var currRoom = roomList[socket.id];

      info[f.messageid] = TimeUuid.fromDate(date);

      return sendInRoom(socket, currRoom, info);
    }

    options[f.id] = sanitize(options[f.id]);

    if (!checkInput(constants.IO_PRIVATE_MESSAGE, socket, userList, options)){ return; }

    async.waterfall([//////////////////////////////////////////////////////////////
      function (cb) { // Получаем данные адресата и готовим сообщение к добавлению в историю
        var friendProfile = null;
        if (profiles[options[f.id]]) { // Если онлайн
          friendProfile = profiles[options[f.id]];
          cb(null, friendProfile);
        }
        else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options[f.id], function (err, info) {  // Нужен VID и все поля, как при подключении
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

          chat[f.date] = firstDate;
          selfProfile.getHistory(chat, function (err, history) {
            if (err) { return cb(err, null); }

            history = history || [];
            history.sort(compareDates);

            for (var i = 0; i < history.length; i++) {
              sendOne(socket, history[i]);
            }
          });
        } // Если собеседник онлайн и у него не открыт чат с нами
        if (profiles[options[f.id]] && !friendProfile.isPrivateChat(selfProfile.getID())) {
          chat = fillInfo(selfProfile);

          friendProfile.addPrivateChat(chat);

          chat[f.date] = firstDate;
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
        savingMessage[f.date]         = date;
        savingMessage[f.companionid]  = selfProfile.getID();
        savingMessage[f.companionvid] = selfProfile.getVID();
        savingMessage[f.incoming]     = true;
        savingMessage[f.text]         = text;

        friendProfile.addMessage(savingMessage, function (err, message) {
          if (err) { return cb(err, null); }

          if (profiles[options[f.id]]) {
            var friendSocket = friendProfile.getSocket();

            if(friendProfile.isPrivateChat(selfProfile.getID())) {
              info[f.chat] = selfProfile.getID();
              info[f.chatVID] = selfProfile.getVID();
              info[f.messageid] = message[f.messageid];
              sendOne(friendSocket, info);
            } else {
              friendSocket.emit(constants.IO_GET_NEWS, friendProfile.getNews());
            }
          }
          cb(null, savingMessage, friendProfile, date);
        });
      }, //////////////////////////////////////////////////////////////////////////////////////
      function (savingMessage, friendProfile, date, cb) { // Сохраняем сообщение в историю отправителя

        savingMessage[f.date]         = date;
        savingMessage[f.companionid]  = friendProfile.getID();
        savingMessage[f.companionvid] = friendProfile.getVID();
        savingMessage[f.incoming]     = false;
        //savingMessage[f.text]         = options[f.text];

        selfProfile.addMessage(savingMessage, function (err, message) {
          if (err) { cb(err, null); }

          info[f.chat] = friendProfile.getID();
          info[f.chatVID] = friendProfile.getVID();
          info[f.messageid] = message[f.messageid];
          sendOne(socket, info);

          cb(null, null);
        });
      }/////////////////////////////////////////////////////////////////////////////////
    ], function (err) { // Вызывается последней или в случае ошибки
      if (err) { new GameError(socket, constants.IO_MESSAGE, err.message); }
    });
  });
};


// Для сортировки массива сообщений (получение топа по дате)
function compareDates(mesA, mesB) {
  var f = constants.FIELDS;
  return mesA[f.date] - mesB[f.date];
}

function fillInfo(profile) {
  var f = constants.FIELDS;
  var info = {};
  info[f.id]      = profile.getID();
  info[f.vid]     = profile.getVID();
  info[f.age]     = profile.getAge();
  info[f.sex]     = profile.getSex();
  info[f.city]    = profile.getCity();
  info[f.country] = profile.getCountry();
  info[f.points]  = profile.getPoints();

  return info;
}