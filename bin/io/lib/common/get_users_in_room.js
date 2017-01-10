/**
 * Отправляем пользователям информацию о комнате, в которой они находятся
 *
 * @param info - сведения о комнате, selfID - ид пользователя, сведения о котором следует вернуть, callback
 * @return info
 */

const constants = require('./../../../constants');

module.exports = function(room, selfId) {

  let res = null;

  let usersInRoom = room.getAllPlayers();
  for(let i = 0; i < usersInRoom.length; i++) {
    let pInfo = room.getPersonalInfo(usersInRoom[i].getID());
    let socket = usersInRoom[i].getSocket();
    if(socket && usersInRoom[i].getID() != selfId) {
      socket.emit(constants.IO_ROOM_USERS, pInfo);
    }
    if(usersInRoom[i].getID() == selfId) {
      res = pInfo;
    }
  }

  return res;

};

