/**
 * Добавляем профиль в пул
 *
 * @param profile, socket
 * @return {boolean} - если уже есть старый - false, если не было - true
 */

const oPool = require('./../../../objects_pool');

module.exports = function (profile, socket) {
  
  // Если присутствует старый профиль этого пользователя, меняем его на новый
  let  oldProfile = oPool.profiles[profile.getID()];
  
  if (oldProfile)  {
    oldProfile.clearExitTimeout();
    oldProfile.clearInactionTimer();
    oldProfile.setActivity();
    oldProfile.setConnectionLost(false);
    
    let  oldSocket = oldProfile.getSocket();
    oldProfile.setSocket(socket);
    
    delete oPool.userList[oldSocket.id];
    oPool.userList[socket.id] =  oldProfile;
    
    let  room = oPool.roomList[oldSocket.id];
    delete  oPool.roomList[oldSocket.id];
    oPool.roomList[socket.id] = room;
    
    return false;
  }
  // либо просто сохраняем новый
  else {
    oPool.userList[socket.id] = profile;
    oPool.profiles[profile.getID()] = profile;
    
    return true;
  }
};