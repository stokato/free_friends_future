/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем балл к званию
 */

var constants = require('./../../../constants');
var PF = constants.PFIELDS;
var oPool = require('./../../../objects_pool');
var logger = require('./../../../../lib/log')(module);

module.exports = function (err, rank, uid) {
  if(err) {
    logger.error('handkeRank: ' + err);
  }
  
  var profile = oPool.profiles[uid];
  var socket = profile.getSocket();
  var room = oPool.roomList[socket.id];
  
  var rankInfo = {};
  rankInfo[PF.RANK] = rank;
  rankInfo[PF.ID] = profile.getID();
  rankInfo[PF.VID] = profile.getVID();
  socket.broadcast.in(room.getName()).emit(constants.IO_NEW_RANK, rankInfo);
};
