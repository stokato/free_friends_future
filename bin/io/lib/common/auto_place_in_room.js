/**
 * Помещаем профиль в произвольную комнату (из числа не полных)
 *
 * @param socket, callback
 * @return newRoom
 */

const createRoom  = require('./create_room');
const oPool       = require('./../../../objects_pool');
const Config      = require('./../../../../config.json');

module.exports = function (socket,  callback) {
  
  const ONE_SEX_IN_ROOM  = Config.io.one_sex_in_room;
  const GUY = Config.user.constants.sex.male;
  const GIRL = Config.user.constants.sex.female;
  
  let  selfProfile = oPool.userList[socket.id];
  let  newRoom = null;
  let  count = ONE_SEX_IN_ROOM;
  let  sex = selfProfile.getSex();

  // Получаем название текущей комнаты (если есть такая)
  let  selfRoomName = '';
  if(oPool.roomList[socket.id]) {
    selfRoomName = oPool.roomList[socket.id].getName();
  }

  // Выбираем комнату с наименьшим количеством пустующих мест для этого пола
  let  item;
  for(item in oPool.rooms) if (oPool.rooms.hasOwnProperty(item)) {
    if(item != selfRoomName) {
      let  need = ONE_SEX_IN_ROOM - oPool.rooms[item].getCountInRoom(sex);

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
  
  let  oldRoom = oPool.roomList[socket.id];
  if(oldRoom) {
    oldRoom.deleteProfile(selfProfile);
    
    if(oldRoom.getCountInRoom(GUY) == 0 &&
      oldRoom.getCountInRoom(GIRL) == 0)  {
      delete oPool.rooms[oldRoom.getName()];
    }
  }

  newRoom.addProfile(selfProfile, (err) => {
    if(err) { return callback(err); }

    newRoom.getRanks().addEmits(socket);
    newRoom.getMusicPlayer().addEmits(socket);

    selfProfile.setGame(newRoom.getGame());
    oPool.roomList[socket.id] = newRoom;

    callback(null, newRoom);
  });

};

