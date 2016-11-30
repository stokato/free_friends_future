/**
 * Меняем статус пользователя
 *
 * @param socket, options - объект со статусом, callback
 * @return {Object} - с новым статусом
 */
var constants = require('./../../../constants'),
   oPool      = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  selfProfile.setStatus(options[constants.PFIELDS.STATUS], function (err, status) {
    if (err) { return callback(err); }
    
    var res = {};
    res[constants.PFIELDS.STATUS] = status;
    
    callback(null, res);
  });
  
};