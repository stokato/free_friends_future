var async     =  require('async');

var constants = require('./../../../constants'),
    PF        = constants.PFIELDS,
    oPool = require('../../../objects_pool');

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
      
      // Отбираем комнаты со свободными для нашего пола местами
      for (item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)
        && oPool.rooms[item].getCountInRoom(sex) < constants.ONE_SEX_IN_ROOM &&
        oPool.roomList[socket.id].getName() != oPool.rooms[item].getName()) {
        
        freeRooms.push(oPool.rooms[item]);
      }
      
      if(freeRooms.length > 0) {
        var index = Math.floor(Math.random() * freeRooms.length);
        
        var info = freeRooms[index].getInfo();
        cb(null, info);
        
      } else {
        cb(null, null);
      }
    },////////////////////////////////// Получаем всех друзей пользователя
    function (roomInfo, cb) {
      
      selfProfile.getFriends(false, function (err, allFriendsInfo) {
        if (err) { return cb(err, null); }
        
        cb(null, roomInfo, allFriendsInfo[PF.FRIENDS]);
      });
      
    },///////////////////////// Составляем список друзей с неполными коматами
    function (roomInfo, allFriends, cb) { allFriends = allFriends || [];
      var friendList = [];
            
      for (var i = 0; i < allFriends.length; i++) {
        var currFriend = oPool.profiles[allFriends[i].id];
        if (currFriend) {
          var friendSocket = currFriend.getSocket();
          var friendsRoom = oPool.roomList[friendSocket.id];
          if (friendsRoom.getCountInRoom(sex) < constants.ONE_SEX_IN_ROOM) {
            
            var currInfo = {};
            currInfo[PF.ID] = currFriend.getID();
            currInfo[PF.VID] = currFriend.getVID();
            currInfo[PF.AGE] = currFriend.getAge();
            currInfo[PF.SEX] = currFriend.getSex();
            currInfo[PF.CITY] = currFriend.getCity();
            currInfo[PF.COUNTRY] = currFriend.getCountry();
            currInfo[PF.ROOM] = friendsRoom.getName();
            
            friendList.push(currInfo);
          }
        }
      }
      
      cb(null, roomInfo, friendList);
    }////////////////////////////////// Обрабатываем ошибки или отравляем результат
  ], function (err, roomInfo, friendList) {
    if (err) { return callback(err); }
    
      var res = {};
      res[PF.RANDOM] = roomInfo;
      res[PF.FRIENDS] = friendList;
    
      callback(null, res);
  });
  
};
