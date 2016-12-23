/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Устанавливаем активность звания
 */
var constants =  require('./../../../constants'),
    oPool     = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var ranksM = oPool.roomList[socket.id].getRanks();
  var selfProfile = oPool.userList[socket.id];
  
  var rankOwnerID = ranksM.getRankOwner(options[constants.PFIELDS.RANK]);
  
  if(rankOwnerID != selfProfile.getID()) {
    return callback(constants.errors.NO_SUCH_RUNK, null);
  }
  
  oPool.userList[socket.id].setActiveRank(options[constants.PFIELDS.RANK]);
  
  callback(null, null);
};