/**
 * Получаем произовльную комнату со свободными местами
 * и список друзей оналйн, в чьих комнатах есть своодные места
 *
 * @param socket, options, callback
 * @return {Object}
 */

var async     =  require('async');

var constants = require('./../../../constants'),
    PF        = constants.PFIELDS,
    oPool = require('../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  var sex         = selfProfile.getSex();
  
  async.waterfall([//--------------------------------------------------
    function (cb) { // Отбираем комнаты, в которых не хватает игроков нашего пола
      
      var freeRooms = [];
      var item;
      
      for (item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)
        && oPool.rooms[item].getCountInRoom(sex) < constants.ONE_SEX_IN_ROOM &&
        oPool.roomList[socket.id].getName() != oPool.rooms[item].getName()) {
        
        freeRooms.push(oPool.rooms[item]);
      }
      
      // Выбираем произовольно одну из комнат
      if(freeRooms.length > 0) {
        var index = Math.floor(Math.random() * freeRooms.length);
        
        var info = freeRooms[index].getInfo();
        cb(null, info);
        
      } else {
        cb(null, null);
      }
    },//--------------------------------------------------
    function (roomInfo, cb) { // Получаем всех друзей пользователя
      
      selfProfile.getFriends(false, function (err, allFriendsInfo) {
        if (err) { return cb(err, null); }
        
        cb(null, roomInfo, allFriendsInfo[PF.FRIENDS]);
      });
      
    },//--------------------------------------------------
    function (roomInfo, allFriends, cb) { allFriends = allFriends || []; //Составляем список друзей с неполными коматами
      var friendList = [];
            
      for (var i = 0; i < allFriends.length; i++) {
        var currFriend = oPool.profiles[allFriends[i].id];
        if (currFriend) {
          var friendSocket = currFriend.getSocket();
          var friendsRoom = oPool.roomList[friendSocket.id];
          if (friendsRoom.getCountInRoom(sex) < constants.ONE_SEX_IN_ROOM) {
            
            var currInfo = {};
            currInfo[PF.ID]       = currFriend.getID();
            currInfo[PF.VID]      = currFriend.getVID();
            currInfo[PF.AGE]      = currFriend.getAge();
            currInfo[PF.SEX]      = currFriend.getSex();
            currInfo[PF.CITY]     = currFriend.getCity();
            currInfo[PF.COUNTRY]  = currFriend.getCountry();
            currInfo[PF.ROOM]     = friendsRoom.getName();
            
            friendList.push(currInfo);
          }
        }
      }
      
      cb(null, roomInfo, friendList);
    }//--------------------------------------------------
  ], function (err, roomInfo, friendList) { // Обрабатываем ошибки или отравляем результат
    if (err) { return callback(err); }
    
      var res = {};
      res[PF.RANDOM] = roomInfo;
      res[PF.FRIENDS] = friendList;
    
      callback(null, res);
  });
  
};
