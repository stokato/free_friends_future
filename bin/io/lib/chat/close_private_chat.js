/**
 * Закрываем приватный чат
 *
 * @param socket, options - объект с ид чата, callback
 * @return res - объект с ид чата
 */

var constants     = require('./../../../constants'),
    oPool         = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  if(!selfProfile.isPrivateChat(options[constants.PFIELDS.ID])) {
    return callback(constants.errors.NO_SUCH_CHAT);
  }
  
  selfProfile.deletePrivateChat(options[constants.PFIELDS.ID]);
  
  var res = {};
  res[constants.PFIELDS.ID] = options[constants.PFIELDS.ID];
  
  callback(null, res);
};
