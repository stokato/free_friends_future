/**
 * Получаем произовльную комнату со свободными местами
 * и список друзей оналйн, в чьих комнатах есть своодные места
 *
 * @param socket, options, callback
 * @return {Object}
 */

const async     =  require('async');

const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');
const oPool     = require('../../../objects_pool');
const emitRes   = require('./../../../emit_result');

module.exports = function (socket, options) {
  
  const ONE_SEX_IN_ROOM  = Config.io.one_sex_in_room;
  
  let  selfProfile = oPool.userList[socket.id];
  let  sex         = selfProfile.getSex();
  
  async.waterfall([//--------------------------------------------------
    function (cb) { // Отбираем комнаты, в которых не хватает игроков нашего пола
      
      let  freeRoomsArr = [];
      
      for (let item in oPool.rooms)
        if (oPool.rooms.hasOwnProperty(item)  &&
              oPool.rooms[item].getCountInRoom(sex) < ONE_SEX_IN_ROOM &&
              oPool.roomList[socket.id].getName() != oPool.rooms[item].getName()) {
        
        freeRoomsArr.push(oPool.rooms[item]);
      }
      
      // Выбираем произовольно одну из комнат
      if(freeRoomsArr.length > 0) {
        let  rand = Math.floor(Math.random() * freeRoomsArr.length);
        
        let  infoObj = freeRoomsArr[rand].getInfo();
        cb(null, infoObj);
        
      } else {
        cb(null, null);
      }
    },//--------------------------------------------------
    function (roomInfoObj, cb) { // Получаем всех друзей пользователя
      
      selfProfile.getFriends(false, (err, allFriendsInfoObj) => {
        if (err) {
          return cb(err, null);
        }
        
        cb(null, roomInfoObj, allFriendsInfoObj[PF.FRIENDS]);
      });
      
    },//--------------------------------------------------
    //Составляем список друзей с неполными коматами
    function (roomInfoObj, allFriendsArr, cb) { allFriendsArr = allFriendsArr || [];
      let  firendsArr = [];
      let friendsCount = allFriendsArr.length;
      
      for (let  i = 0; i < friendsCount; i++) {
        let  friendProfile = oPool.profiles[allFriendsArr[i].id];
        
        if (friendProfile) {
          let  friendSocket = friendProfile.getSocket();
          let  friendsRoom = oPool.roomList[friendSocket.id];
          if (friendsRoom.getCountInRoom(sex) < ONE_SEX_IN_ROOM) {
  
            let  currInfoObj = {
              [PF.ID]       : friendProfile.getID(),
              [PF.VID]      : friendProfile.getVID(),
              [PF.AGE]      : friendProfile.getAge(),
              [PF.SEX]      : friendProfile.getSex(),
              [PF.CITY]     : friendProfile.getCity(),
              [PF.COUNTRY]  : friendProfile.getCountry(),
              [PF.ROOM]     : friendsRoom.getName()
            };
            
            firendsArr.push(currInfoObj);
          }
        }
      }
      
      cb(null, roomInfoObj, firendsArr);
    }//--------------------------------------------------
  ], function (err, roomInfo, friendList) { // Обрабатываем ошибки или отравляем результат
    if (err) {
      return emitRes(err, socket, Config.io.emits.IO_CHOOSE_ROOM);
    }
    
      let  resObj = {
        [PF.RANDOM] : roomInfo,
        [PF.FRIENDS] : friendList
      };
    
      emitRes(null, socket, Config.io.emits.IO_CHOOSE_ROOM, resObj);
  });
  
};
