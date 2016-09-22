var constants = require('./../../constants'),
    defineSex = require('./define_sex'),
    createRoom = require('./create_room');

var oPool = require('./../../objects_pool');
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

  var sex = defineSex(selfProfile);

  var selfRoomName = '';
  if(oPool.roomList[socket.id]) {
    selfRoomName = oPool.roomList[socket.id].name;
  }

  var item;
  for(item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)) {
    if(item != selfRoomName) {
      var need = constants.ONE_SEX_IN_ROOM - oPool.rooms[item][sex.len];

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

  newRoom[sex.sexArr][selfProfile.getID()] = selfProfile;
  newRoom[sex.len] ++;
  
  // var index = newRoom[sex.counter];
  // selfProfile.setGameIndex(index);
  // newRoom[sex.counter] += 2;
  

  var oldRoom = oPool.roomList[socket.id];
  if(oldRoom) {
    socket.leave(oldRoom.name);
    delete oldRoom[sex.sexArr][selfProfile.getID()];
    oldRoom[sex.len]--;
    if(oldRoom.guys_count == 0 && oldRoom.girls_count == 0) delete oPool.rooms[oldRoom.name];
    oldRoom[sex.indexes].push(selfProfile.getGameIndex());
  }
  
  var indexes = newRoom[sex.indexes];
  indexes.sort(function (i1, i2) { return i1 - i2; });
  selfProfile.setGameIndex(indexes[0]);
  indexes.splice(0, 1);
  
  selfProfile.setGame(newRoom.game);
  oPool.roomList[socket.id] = newRoom;

  callback(null, newRoom);
};

