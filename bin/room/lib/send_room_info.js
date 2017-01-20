/**
 * Отправляем пользователям информацию о комнате, в которой они находятся
 *
 * @param info - сведения о комнате, selfID - ид пользователя, сведения о котором следует вернуть, callback
 * @return info
 */

const Config = require('./../../../config.json');

module.exports = function(excludeID = null) {
  
  let usersInRoomArr = this.getAllPlayers();
  let usersCount = usersInRoomArr.length;
  
  for(let i = 0; i < usersCount; i++) {
    
    if(usersInRoomArr[i].getID() != excludeID) {
      let pInfo = this.getPersonalInfo(usersInRoomArr[i].getID());
  
      let socket = usersInRoomArr[i].getSocket();
      if(socket) {
        socket.emit(Config.io.emits.IO_ROOM_USERS, pInfo);
      }
    }
  }
};

