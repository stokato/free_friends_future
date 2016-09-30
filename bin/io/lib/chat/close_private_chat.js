
// Свои модули
var constants     = require('./../../../constants'),
  oPool            = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  if(!selfProfile.isPrivateChat(options.id)) {
    return callback(constants.errors.NO_SUCH_CHAT);
  }
  
  selfProfile.deletePrivateChat(options.id);
  
  callback(null, { id : options.id });
  
};
