var oPool = require('./../../../objects_pool');

module.exports = function (selfProfile, socket) {
  
  // Если присутствует старый профиль этого пользователя, меняем его на новый
  var oldProfile = oPool.profiles[selfProfile.getID()];
  
  if (oldProfile)  {
    oldProfile.clearExitTimeout();
    
    var oldSocket = oldProfile.getSocket();
    oldProfile.setSocket(socket);
    
    delete oPool.userList[oldSocket.id];
    oPool.userList[socket.id] =  oldProfile;
    
    var room = oPool.roomList[oldSocket.id];
    delete  oPool.roomList[oldSocket.id];
    oPool.roomList[socket.id] = room;
    
    return false;
  }
  // либо сохраняем новый
  else {
    oPool.userList[socket.id] = selfProfile;
    oPool.profiles[selfProfile.getID()] = selfProfile;
    
    return true;
  }
};