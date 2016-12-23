/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Получаем прогресс по званиям игрока
 *
 */

var constants =  require('./../../../constants'),
  oPool     = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var ranksM = oPool.roomList[socket.id].getRanks();
  var selfProfile = oPool.userList[socket.id];
  
  var ranks = ranksM.getRanksOfProfile(selfProfile.getID()) || {};
  
  ranks[constants.PFIELDS.ACTIVE_RANK] = selfProfile.getActiveRank() || null;
  
  callback(null, ranks);
};