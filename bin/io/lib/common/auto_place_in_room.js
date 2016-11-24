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

  // Получаем название текущей комнаты (если есть такая)
  var selfRoomName = '';
  if(oPool.roomList[socket.id]) {
    selfRoomName = oPool.roomList[socket.id].getName();
  }

  // Выбирае комнату с наименьшим количеством пустующих мест для этого пола
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
    oldRoom.deleteProfile(sex, selfProfile);
    
    if(oldRoom.getCountInRoom(constants.GUY) == 0 &&
      oldRoom.getCountInRoom(constants.GIRL) == 0)  {
      delete oPool.rooms[oldRoom.getName()];
    }
  }
  
  newRoom.addProfile(sex, selfProfile);
  
  selfProfile.setGame(newRoom.getGame());
  oPool.roomList[socket.id] = newRoom;

  callback(null, newRoom);
};

