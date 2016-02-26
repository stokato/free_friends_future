var constats = require('./../constants_io'),
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
  var profile = userList[socket.id];
  var room = null;
  var count = constats.ONE_GENDER_IN_ROOM +1;

  var sex = defineSex(profile);

  var selfRoomName = '';
  if(roomList[socket.id]) {
    selfRoomName = roomList[socket.id].name;
  }

  var item;
  for(item in rooms) if (rooms.hasOwnProperty(item)) {
    if(item != selfRoomName) {
      var need = constats.ONE_GENDER_IN_ROOM - rooms[item][sex.len];

      if(need > 0 && need < count) {
        count = need;
        room = rooms[item];
      }
    }
  }

  if(!room) { // Нет ни одной свободной комнаты
    room = createRoom(socket);
    rooms[room.name] = room;
  }

  socket.join(room.name);

  room[sex.sexArr][profile.getID()] = profile;
  room[sex.len] ++;

  var oldRoom = roomList[socket.id];
  if(oldRoom) {
    socket.leave(oldRoom.name);
    delete oldRoom[sex.sexArr][profile.getID()];
    oldRoom[sex.len]--;
    if(oldRoom.guys_count == 0 && oldRoom.girls_count == 0) delete rooms[oldRoom.name];
  }

  roomList[socket.id] = room;

  callback(null, room);
};

