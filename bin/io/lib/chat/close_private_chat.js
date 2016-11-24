var constants     = require('./../../../constants'),
    oPool         = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  if(!selfProfile.isPrivateChat(options.id)) {
    return callback(constants.errors.NO_SUCH_CHAT);
  }
  
  selfProfile.deletePrivateChat(options[constants.PFIELDS.ID]);
  
  var res = {};
  res[constants.PFIELDS.ID] = options[constants.PFIELDS.ID];
  
  callback(null, res);
};
