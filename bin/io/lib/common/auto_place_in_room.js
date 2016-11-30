/**
 * Помещаем профиль в произвольную комнату (из числа не полных)
 *
 * @param socket, callback
 * @return newRoom
 */

var constants = require('./../../../constants'),
    createRoom = require('./create_room'),
    oPool = require('./../../../objects_pool');

module.exports = function (socket,  callback) {
  var selfProfile = oPool.userList[socket.id];
  var newRoom = null;
  var count = constants.ONE_SEX_IN_ROOM;

  var sex = selfProfile.getSex();

  // Получаем название текущей комнаты (если есть такая)
  var selfRoomName = '';
  if(oPool.roomList[socket.id]) {
    selfRoomName = oPool.roomList[socket.id].getName();
  }

  // Выбираем комнату с наименьшим количеством пустующих мест для этого пола
  var item;
  for(item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)) {
    if(item != selfRoomName) {
      var need = constants.ONE_SEX_IN_ROOM - oPool.rooms[item].getCountInRoom(sex);

      if(need > 0 && need <= count) {
        count = need;
        newRoom = oPool.rooms[item];
      }
    }
  }
  
  // Нет ни одной свободной комнаты, создаем новую
  if(!newRoom) {
    newRoom = createRoom(socket, oPool.userList);
    oPool.rooms[newRoom.getName()] = newRoom;
  }
  
  var oldRoom = oPool.roomList[socket.id];
  if(oldRoom) {
    oldRoom.deleteProfile(selfProfile);
    
    if(oldRoom.getCountInRoom(constants.GUY) == 0 &&
      oldRoom.getCountInRoom(constants.GIRL) == 0)  {
      delete oPool.rooms[oldRoom.getName()];
    }
  }
  
  newRoom.addProfile(selfProfile);
  
  selfProfile.setGame(newRoom.getGame());
  oPool.roomList[socket.id] = newRoom;

  callback(null, newRoom);
};

