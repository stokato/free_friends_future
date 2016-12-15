/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Удаляем пользователя из черного списка
 */

var async = require('async');

var constants  = require('./../../../constants'),
  PF         = constants.PFIELDS,
  oPool      = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    callback(constants.errors.SELF_ILLEGAL);
  }
  
  selfProfile.delFromBlackList(options[PF.ID], function (err) {
    if (err) { return callback(err); }
  
    callback(null, null);
  });
  
};


