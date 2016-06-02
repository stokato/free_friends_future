var constants = require('./../constants'),
    defineSex = require('./define_sex'),
    createRoom = require('./create_room');
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
module.exports = function (socket, userList, roomList, rooms, callback) {
  var selfProfile = userList[socket.id];
  var newRoom = null;
  var count = constants.ONE_SEX_IN_ROOM +1;

  var sex = defineSex(selfProfile);

  var selfRoomName = '';
  if(roomList[socket.id]) {
    selfRoomName = roomList[socket.id].name;
  }

  var item;
  for(item in rooms) if (rooms.hasOwnProperty(item)) {
    if(item != selfRoomName) {
      var need = constants.ONE_SEX_IN_ROOM - rooms[item][sex.len];

      if(need > 0 && need < count) {
        count = need;
        newRoom = rooms[item];
      }
    }
  }

  if(!newRoom) { // Нет ни одной свободной комнаты
    newRoom = createRoom(socket, userList);
    rooms[newRoom.name] = newRoom;
  }

  socket.join(newRoom.name);

  newRoom[sex.sexArr][selfProfile.getID()] = selfProfile;
  newRoom[sex.len] ++;
  var index = newRoom[sex.counter];
  selfProfile.setGameIndex(index);
  newRoom[sex.counter] += 2;

  var oldRoom = roomList[socket.id];
  if(oldRoom) {
    socket.leave(oldRoom.name);
    delete oldRoom[sex.sexArr][selfProfile.getID()];
    oldRoom[sex.len]--;
    if(oldRoom.guys_count == 0 && oldRoom.girls_count == 0) delete rooms[oldRoom.name];
  }
  selfProfile.setGame(newRoom.game);
  roomList[socket.id] = newRoom;

  callback(null, newRoom);
};

