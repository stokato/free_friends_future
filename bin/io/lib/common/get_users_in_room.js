/**
 * Отправляем пользователям информацию о комнате, в которой они находятся
 *
 * @param room - комната, selfID - ид пользователя, сведения о котором следует вернуть, callback
 * @return info
 */

module.exports = function(room, selfID = null) {

  let res = null;

  let usersInRoom = room.getAllPlayers();
  for(let i = 0; i < usersInRoom.length; i++) {
    if(usersInRoom[i].getID() == selfID) {
      return room.getPersonalInfo(usersInRoom[i].getID());
    }
  }

  return res;
};

