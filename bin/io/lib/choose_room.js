var async     =  require('async');

var GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    constants = require('./../constants_io'),
    defineSex = require('./define_sex'),
    createRoom = require('./create_room'),
    getRoomInfo = require('./get_room_info');
/*
 Предлагаем способ смены комнаты
 - Получаем профиль
 - Узнаем пол
 - Получаем комнаты, в которых есть место для нашего пола
 - Выбираем из них рендомом одну
 - Получаем всех наших друзей (из БД)
 - Если друг онлайн и в его комнате есть место для нашего пола - добавляем в выходной список
 - Отправляем клиенту случайную комнату и список друзей (какие данные нужны ???)
 */
module.exports = function (socket, userList, roomList, rooms, profiles) {
  socket.on('choose_room', function() {
    if (!checkInput('choose_room', socket, userList, null))
      return new GameError(socket, "CHOOSEROOM", "Верификация не пройдена");

    async.waterfall([////////////////// Отбираем комнаты, в которых не хватает игроков
      function (cb) {
        var profile = userList[socket.id];

        var freeRooms = [];

        var sex = defineSex(profile);

        var item;
        for (item in rooms) if (rooms.hasOwnProperty(item)
          && rooms[item][sex.len] < constants.ONE_SEX_IN_ROOM &&
          roomList[socket.id].name != rooms[item].name) {
          freeRooms.push(rooms[item]);
        }

        if(freeRooms.length > 0) {
          var index = randomInteger(0, freeRooms.length - 1);
          var randRoom = freeRooms[index];
          getRoomInfo(randRoom, function (err, info) {
            if (err) { return cb(err, null); }

            cb(null, profile, info, sex.sexArr, sex.len);
          });
        } else {
          cb(null, profile, null, sex.sexArr, sex.len);
        }
        //if (freeRooms.length == 0) {
        //  var newRoom = createRoom(socket);
        //  rooms[newRoom.name] = newRoom;
        //  freeRooms.push(newRoom);
        //}
      },////////////////////////////////// Получаем всех друзей пользователя
      function (profile, roomInfo, genArr, len, cb) {
        profile.getFriends(function (err, allFriends) {
          if (err) { return cb(err, null); }

          cb(null, roomInfo, len, allFriends);
        });
      },///////////////////////// Составляем список друзей с неполными коматами
      function (roomInfo, len, allFriends, cb) {
        var friendList = [];
        allFriends = allFriends || [];
        var i = null;
        var friendsLen = allFriends.length;
        for (i = 0; i < friendsLen; i++) {
          var currFriend = profiles[allFriends[i].id];
          if (currFriend) {
            var frSocket = currFriend.getSocket();
            var friendsRoom = roomList[frSocket.id];
            if (friendsRoom[len] < constants.ONE_SEX_IN_ROOM) {
              var currInfo = {
                id: currFriend.getID(),
                vid: currFriend.getVID(),
                age: currFriend.getAge(), //
                sex: currFriend.getSex(),
                city: currFriend.getCity(),
                country: currFriend.getCountry(), //
                room: friendsRoom.name
              };
              friendList.push(currInfo);
            }
          }
        }
        var res = {
          random: roomInfo,
          friends: friendList
        };

        cb(null, res);
      }////////////////////////////////// Обрабатываем ошибки или отравляем результат
    ], function (err, res) {
      if (err) { return new GameError(socket, "CHOOSEROOM", err.message); }

      socket.emit('choose_room', res);
    })
  });
};

function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}
