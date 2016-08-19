var async     =  require('async');

var GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    constants = require('./../../constants'),
    defineSex = require('./define_sex'),
    //createRoom = require('./create_room'),
    getRoomInfo = require('./get_room_info');

var oPool = require('./../../objects_pool');

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
module.exports = function (socket) {
  socket.on(constants.IO_CHOOSE_ROOM, function(options) {
    if (!checkInput(constants.IO_CHOOSE_ROOM, socket, oPool.userList, options)) { return; }

    async.waterfall([////////////////// Отбираем комнаты, в которых не хватает игроков
      function (cb) {
        var selfProfile = oPool.userList[socket.id];

        var freeRooms = [];

        var sex = defineSex(selfProfile);

        var item;
        for (item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)
          && oPool.rooms[item][sex.len] < constants.ONE_SEX_IN_ROOM &&
          oPool.roomList[socket.id].name != oPool.rooms[item].name) {
          freeRooms.push(oPool.rooms[item]);
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
        //  oPool.rooms[newRoom.name] = newRoom;
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
          var currFriend = oPool.profiles[allFriends[i]["id"]];
          if (currFriend) {
            var friendSocket = currFriend.getSocket();
            var friendsRoom = oPool.roomList[friendSocket["id"]];
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

        cb(null, roomInfo, friendList);
      }////////////////////////////////// Обрабатываем ошибки или отравляем результат
    ], function (err, roomInfo, friendList) {
      if (err) { return handError(err); }

      socket.emit(constants.IO_CHOOSE_ROOM, {
        random : roomInfo,
        friends : friendList,
        operation_status : constants.RS_GOODSTATUS
      });
    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_CHOOSE_ROOM, res);

      new GameError(socket, constants.IO_CHOOSE_ROOM, err.message || constants.errors.OTHER.message);
    }
  });
};
