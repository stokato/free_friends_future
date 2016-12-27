/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Возвращаем активное звние
 */

var constants =  require('./../../../constants'),
  oPool    = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var activeRank = oPool.userList[socket.id].getActiveRank();
  
  var res = {};
  res[constants.PFIELDS.RANK] = activeRank || null;
  
  callback(null, res);
};
