/**
 * Закрываем соединение
 *
 * @param socket
 */

const Config    = require('./../../../../config.json');
const oPool     = require('./../../../objects_pool');
const disconnect      = require('../common/disconnect');

module.exports = function (socket) {
  
  const EXIT_TIMEOUT  = Number(Config.io.exit_timeout);
  
  socket.on(Config.io.emits.IO_DISCONNECT, function() {
    let selfProfile = oPool.userList[socket.id];
    if(!selfProfile) {
      return socket.disconnect();
    }
    
    selfProfile.clearInactionTimer();
    
    selfProfile.setExitTimeout( setTimeout(() => { disconnect(socket); }, EXIT_TIMEOUT));
    
  });
};