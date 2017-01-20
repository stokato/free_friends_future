/**
 * Отправляем пользователям информацию о комнате, в которой они находятся
 *
 * @param room - комната, selfID - ид пользователя, сведения о котором следует вернуть, callback
 * @param selfID = null - если это свой ИД, возвращаем инфо с данными о друзьях в комнате
 * @return info
 */

module.exports = function(room, selfID = null) {

  let res = null;

  let usersInRoomArr = room.getAllPlayers();
  let usersCount = usersInRoomArr.length;
  
  for(let i = 0; i < usersCount; i++) {
    if(usersInRoomArr[i].getID() == selfID) {
      
      return room.getPersonalInfo(usersInRoomArr[i].getID());
    }
  }

  return res;
};

