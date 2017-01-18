/**
 * Получаем произовльную комнату со свободными местами
 * и список друзей оналйн, в чьих комнатах есть своодные места
 *
 * @param socket, options, callback
 * @return {Object}
 */

const async     =  require('async');

const Config = require('./../../../../config.json');
const constants = require('./../../../constants');
const oPool     = require('../../../objects_pool');
const emitRes   = require('./../../../emit_result');

const PF        = constants.PFIELDS;
const ONE_SEX_IN_ROOM  = Config.io.one_sex_in_room;

module.exports = function (socket, options) {
  
  let  selfProfile = oPool.userList[socket.id];
  let  sex         = selfProfile.getSex();
  
  async.waterfall([//--------------------------------------------------
    function (cb) { // Отбираем комнаты, в которых не хватает игроков нашего пола
      
      let  freeRooms = [];
      let  item;
      
      for (item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)
        && oPool.rooms[item].getCountInRoom(sex) < ONE_SEX_IN_ROOM &&
        oPool.roomList[socket.id].getName() != oPool.rooms[item].getName()) {
        
        freeRooms.push(oPool.rooms[item]);
      }
      
      // Выбираем произовольно одну из комнат
      if(freeRooms.length > 0) {
        let  index = Math.floor(Math.random() * freeRooms.length);
        
        let  info = freeRooms[index].getInfo();
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
      let  friendList = [];
            
      for (let  i = 0; i < allFriends.length; i++) {
        let  currFriend = oPool.profiles[allFriends[i].id];
        if (currFriend) {
          let  friendSocket = currFriend.getSocket();
          let  friendsRoom = oPool.roomList[friendSocket.id];
          if (friendsRoom.getCountInRoom(sex) < ONE_SEX_IN_ROOM) {
  
            let  currInfo = {
              [PF.ID]       : currFriend.getID(),
              [PF.VID]      : currFriend.getVID(),
              [PF.AGE]      : currFriend.getAge(),
              [PF.SEX]      : currFriend.getSex(),
              [PF.CITY]     : currFriend.getCity(),
              [PF.COUNTRY]  : currFriend.getCountry(),
              [PF.ROOM]     : friendsRoom.getName()
            };
            
            friendList.push(currInfo);
          }
        }
      }
      
      cb(null, roomInfo, friendList);
    }//--------------------------------------------------
  ], function (err, roomInfo, friendList) { // Обрабатываем ошибки или отравляем результат
    if (err) { return emitRes(err, socket, constants.IO_CHOOSE_ROOM); }
    
      let  res = {
        [PF.RANDOM] : roomInfo,
        [PF.FRIENDS] : friendList
      };
    
      emitRes(null, socket, constants.IO_CHOOSE_ROOM, res);
  });
  
};
