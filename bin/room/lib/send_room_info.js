/**
 * Отправляем пользователям информацию о комнате, в которой они находятся
 *
 * @param info - сведения о комнате, selfID - ид пользователя, сведения о котором следует вернуть, callback
 * @return info
 */

const Config = require('./../../../config.json');

module.exports = function(excludeID = null) {
  
  let usersInRoom = this.getAllPlayers();
  for(let i = 0; i < usersInRoom.length; i++) {
    
    if(usersInRoom[i].getID() != excludeID) {
      let pInfo = this.getPersonalInfo(usersInRoom[i].getID());
  
      let socket = usersInRoom[i].getSocket();
      if(socket) {
        socket.emit(Config.io.emits.IO_ROOM_USERS, pInfo);
      }
    }
  }
};

