var async     =  require('async');
var GameError = require('../../game_error'),
  checkInput = require('../../check_input');
var constants = require('./../constants_io');
var createRoom = require('./create_room');
var getRoomInfo = require('./get_room_info');
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
        var len = '';
        var sexArr = '';
        if (profile.getSex() == constants.GUY) {
          sexArr = 'guys';
          len = 'guys_count'
        }
        else {
          sexArr = 'girls';
          len = 'girls_count'
        }
        var item;
        for (item in rooms) if (rooms.hasOwnProperty(item)
          && rooms[item][len] < constants.ONE_GENDER_IN_ROOM &&
          roomList[socket.id].name != rooms[item].name) {
          freeRooms.push(rooms[item]);
        }


        if (freeRooms.length == 0) {
          var newRoom = createRoom(socket);
          rooms[newRoom.name] = newRoom;
          freeRooms.push(newRoom);
        }

        var index = randomInteger(0, freeRooms.length - 1);
        var randRoom = freeRooms[index];
        getRoomInfo(randRoom, function (err, info) {
          if (err) { return cb(err, null); }

          cb(null, profile, info, sexArr, len);
        });
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
        for (var i = 0; i < allFriends.length; i++) {
          var currFriend = profiles[allFriends[i].id];
          if (currFriend) {
            var frSocket = currFriend.getSocket();
            var friendsRoom = roomList[frSocket.id];
            if (friendsRoom[len] < constants.ONE_GENDER_IN_ROOM) {
              var currInfo = {
                id: currFriend.getID(),
                vid: currFriend.getVID(),
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
