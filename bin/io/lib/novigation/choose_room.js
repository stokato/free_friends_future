var async     =  require('async');

var constants = require('./../../../constants'),
  getRoomInfo = require('./../common/get_room_info');

var oPool = require('../../../objects_pool');

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
module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  var sex = selfProfile.getSex();
  
  async.waterfall([////////////////// Отбираем комнаты, в которых не хватает игроков
    function (cb) {
      
      var freeRooms = [];
      var item;
      
      for (item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)
        && oPool.rooms[item].getCountInRoom(sex) < constants.ONE_SEX_IN_ROOM &&
        oPool.roomList[socket.id].name != oPool.rooms[item].name) {
        
        freeRooms.push(oPool.rooms[item]);
      }
      
      if(freeRooms.length > 0) {
        var index = Math.floor(Math.random() * freeRooms.length);
        var randRoom = freeRooms[index];
        
        getRoomInfo(randRoom, function (err, info) {
          if (err) { return cb(err, null); }
          
          cb(null, info);
        });
        
      } else {
        cb(null, null);
      }
    },////////////////////////////////// Получаем всех друзей пользователя
    function (roomInfo, cb) {
      selfProfile.getFriends(false, function (err, allFriends) {
        if (err) { return cb(err, null); }
        
        cb(null, roomInfo, allFriends);
      });
    },///////////////////////// Составляем список друзей с неполными коматами
    function (roomInfo, allFriends, cb) { allFriends = allFriends || [];
      var friendList = [];
            
      for (var i = 0; i < allFriends.length; i++) {
        var currFriend = oPool.profiles[allFriends[i]["id"]];
        if (currFriend) {
          var friendSocket = currFriend.getSocket();
          var friendsRoom = oPool.roomList[friendSocket["id"]];
          if (friendsRoom.getCountInRoom(sex) < constants.ONE_SEX_IN_ROOM) {
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
    if (err) { return callback(err); }
    
      callback(null, { random : roomInfo, friends : friendList });
  });
  
};
