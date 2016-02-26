var async     =  require('async');

// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    sendInRoom = require('./send_in_room'),
    sendOne = require('./send_one'),
    genDateHistory  = require('./gen_date_history');

/*
 Отправить личное сообщение: Сообщение, объект с инф. о получателе (VID, еще что то?)
 - Получаем свой профиль
 - Получаем профиль адресата (из ОЗУ или БД)
 - Сохраняем адресату сообщение
 - Сохраняем сообщение себе                                       ???
 - Сообщаем клиену (и второму, если он онлайн) (а что сообщаем?)
 */
module.exports = function (socket, userList, profiles, roomList) {
  socket.on('message', function(options) {
    if (!checkInput('message', socket, userList, options))
      return new GameError(socket, "SENDPRIVMESSAGE", "Верификация не пройдена");

    var selfProfile = userList[socket.id];
    if (selfProfile.getID() == options.id)
      return new GameError(socket, "SENDPRIVMESSAGE", "Нельзя отправлять сообщения себе");

    var chat = options.id;

    var info = {
      id   : selfProfile.getID(),
      vid  : selfProfile.getVID(),
      age  : selfProfile.getAge(), //
      sex  : selfProfile.getSex(),
      city : selfProfile.getCity(),
      country: selfProfile.getCountry(), //
      text : options.text,
      date : new Date()
    };
    if(!chat) {
      var currRoom = roomList[socket.id];

      return sendInRoom(socket, currRoom, info);
    }

    async.waterfall([//////////////////////////////////////////////////////////////
      function (cb) { // Получаем данные адресата и готовим сообщение к добавлению в историю
        var friendProfile = null;
        if (profiles[options.id]) { // Если онлайн
          friendProfile = profiles[options.id];
          cb(null, friendProfile);
        }
        else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {  // Нужен VID и все поля, как при подключении
            if (err) { return cb(err, null); }

            cb(null, friendProfile);
          });
        }
      }, ///////////////////////////////////////////////////////////////////////////////
      function(friendProfile, cb) { // Открываем чат, если еще не открыт
        var chat = null;
        if(!selfProfile.isPrivateChat(friendProfile.getID())) {
          var firstDate = genDateHistory(new Date());
          chat = {
            id      : friendProfile.getID(),
            vid     : friendProfile.getVID(),
            date    : firstDate,
            age     : friendProfile.getAge(), //
            city    : friendProfile.getCity(),
            country : friendProfile.getCountry(),
            sex     : friendProfile.getSex()
          };
          selfProfile.addPrivateChat(chat, function (err, history) {
            if (err) { return cb(err, null); }

            history = history || [];
            history.sort(compareDates);

            for (var i = 0; i < history.length; i++) {
              sendOne(socket, history[i]);
            }
          });
        }
        if (profiles[options.id] && !friendProfile.isPrivateChat(selfProfile.getID())) {
          chat = {
            id       : selfProfile.getID(),
            vid      : selfProfile.getVID(),
            date     : firstDate,
            age      : selfProfile.getAge(), //
            city     : selfProfile.getCity(),
            country  : selfProfile.getCountry(),
            sex      : selfProfile.getSex()
          };
          friendProfile.addPrivateChat(chat, function (err, history) {
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
        var savingMessage = {
          date         : date,
          companionid  : selfProfile.getID(),
          companionvid : selfProfile.getVID(),
          incoming     : true,
          text         : options.text
        };
        friendProfile.addMessage(savingMessage, function (err, result) {
          if (err) { return cb(err, null); }

          if (profiles[options.id]) {
            savingMessage['vid'] = selfProfile.getVID();
            var friendSocket = friendProfile.getSocket();

            if(friendProfile.isPrivateChat(selfProfile.getID())) {
              info.chat = selfProfile.getID();
              sendOne(friendSocket, info);
            } else {
              friendSocket.emit('get_news', friendProfile.getNews());
            }
          }
          cb(null, savingMessage, friendProfile, date);
        });
      }, //////////////////////////////////////////////////////////////////////////////////////
      function (savingMessage, friendProfile, date, cb) { // Сохраняем сообщение в историю отправителя
        savingMessage = {
          date         : date,
          companionid  : friendProfile.getID(),
          companionvid : friendProfile.getVID(),
          incoming     : false,
          text         : options.text
        };
        selfProfile.addMessage(savingMessage, function (err, res) {
          if (err) { cb(err, null); }

          info.chat = friendProfile.getID();
          sendOne(socket, info);

          cb(null, null);
        });
      }/////////////////////////////////////////////////////////////////////////////////
    ], function (err) { // Вызывается последней или в случае ошибки
      if (err) { new GameError(socket, "SENDPRIVMESSAGE", err.message); }
    });
  });
};


// Для сортировки массива сообщений (получение топа по дате)
function compareDates(mesA, mesB) {
  return mesA.date - mesB.date;
}
