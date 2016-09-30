var constants = require('./../../../constants'),
    createRoom = require('./create_room');

var oPool = require('./../../../objects_pool');
/*
 Помещаем пользователя в случайную комнату (при подключении)
 - Получаем свой профиль
 - Узнаем пол
 - Ищем комнату где не хватает наименьшее число игроков нашего пола
 - Если нет свободных комнат, созадем новую
 - Отвязываемся от старой комнаты (наверное лишнее)
 - Привязываемся к новой
 - Возвращаем выбранную комнату
 */
module.exports = function (socket,  callback) {
  var selfProfile = oPool.userList[socket.id];
  var newRoom = null;
  var count = constants.ONE_SEX_IN_ROOM;

  var sex = selfProfile.getSex();

  var selfRoomName = '';
  if(oPool.roomList[socket.id]) {
    selfRoomName = oPool.roomList[socket.id].name;
  }

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

  if(!newRoom) { // Нет ни одной свободной комнаты
    newRoom = createRoom(socket, oPool.userList);
    oPool.rooms[newRoom.name] = newRoom;
  }

  socket.join(newRoom.name);

  newRoom.addProfile(sex, selfProfile);
  
  selfProfile.setGameIndex(newRoom.popIndex(sex));

  var oldRoom = oPool.roomList[socket.id];
  if(oldRoom) {
    socket.leave(oldRoom.name);
    oldRoom.deleteProfile(sex, selfProfile.getID());
    oldRoom.pushIndex(sex, selfProfile.getGameIndex());
    
    if(oldRoom.getCountInRoom(constants.GUY) == 0 &&
        oldRoom.getCountInRoom(constants.GIRL) == 0)  {
      delete oPool.rooms[oldRoom.name];
    }
  }
  
  
  selfProfile.setGame(newRoom.game);
  oPool.roomList[socket.id] = newRoom;

  callback(null, newRoom);
};

