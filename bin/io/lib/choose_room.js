var async     =  require('async');

var GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    constants = require('./../constants'),
    defineSex = require('./define_sex'),
    //createRoom = require('./create_room'),
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
  socket.on(constants.IO_CHOOSE_ROOM, function() {
    if (!checkInput(constants.IO_CHOOSE_ROOM, socket, userList, {})) { return; }
    //var f = constants.FIELDS;

    async.waterfall([////////////////// Отбираем комнаты, в которых не хватает игроков
      function (cb) {
        var selfProfile = userList[socket.id];

        var freeRooms = [];

        var sex = defineSex(selfProfile);

        var item;
        for (item in rooms) if (rooms.hasOwnProperty(item)
          && rooms[item][sex.len] < constants.ONE_SEX_IN_ROOM &&
          roomList[socket.id].name != rooms[item].name) {
          freeRooms.push(rooms[item]);
        }

        if(freeRooms.length > 0) {
          var index = Math.floor(Math.random() * freeRooms.length);
          var randRoom = freeRooms[index];
          getRoomInfo(randRoom, function (err, info) {
            if (err) { return cb(err, null); }

            cb(null, selfProfile, info, sex.sexArr, sex.len);
          });
        } else {
          cb(null, selfProfile, null, sex.sexArr, sex.len);
        }
        //if (freeRooms.length == 0) {
        //  var newRoom = createRoom(socket);
        //  rooms[newRoom.name] = newRoom;
        //  freeRooms.push(newRoom);
        //}
      },////////////////////////////////// Получаем всех друзей пользователя
      function (selfProfile, roomInfo, genArr, len, cb) {
        selfProfile.getFriends(false, function (err, allFriends) {
          if (err) { return cb(err, null); }

          cb(null, roomInfo, len, allFriends);
        });
      },///////////////////////// Составляем список друзей с неполными коматами
      function (roomInfo, len, allFriends, cb) {
        var friendList = [];
        allFriends = allFriends || [];
        var i;
        for (i = 0; i < allFriends.length; i++) {
          var currFriend = profiles[allFriends[i]["id"]];
          if (currFriend) {
            var friendSocket = currFriend.getSocket();
            var friendsRoom = roomList[friendSocket["id"]];
            if (friendsRoom[len] < constants.ONE_SEX_IN_ROOM) {
              var currInfo = {};
              currInfo.id      = currFriend.getID();
              currInfo.vid     = currFriend.getVID();
              currInfo.age     = currFriend.getAge();
              currInfo.sex     = currFriend.getSex();
              currInfo.city    = currFriend.getCity();
              currInfo.country = currFriend.getCountry();
              currInfo.room    = friendsRoom.name;

              friendList.push(currInfo);
            }
          }
        }
        var result = {};
        result.random = roomInfo;
        result.friends = friendList;

        socket.emit(constants.IO_CHOOSE_ROOM, result);

        cb(null, result);
      }////////////////////////////////// Обрабатываем ошибки или отравляем результат
    ], function (err, res) {
      if (err) { return new GameError(socket, constants.IO_CHOOSE_ROOM, err.message); }

    })
  });
};
