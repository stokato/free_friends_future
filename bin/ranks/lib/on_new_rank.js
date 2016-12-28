/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем балл к званию
 */

var constants = require('./../../constants');
var PF = constants.PFIELDS;
var oPool = require('./../../objects_pool');
var logger = require('./../../../lib/log')(module);

module.exports = function (err, rank, ownerid, disownerid) {
  if(err) {
    logger.error('handleRank: ' + err);
  }
  
  var ownerProfile = oPool.profiles[ownerid];
  var socket = ownerProfile.getSocket();
  var room = oPool.roomList[socket.id];
  
  ownerProfile.onSetActiveRank(rank);
  
  var rankInfo = {};
  rankInfo[PF.RANK] = rank;
  rankInfo[PF.ID] = ownerProfile.getID();
  rankInfo[PF.VID] = ownerProfile.getVID();
  socket.emit(constants.IO_NEW_RANK, rankInfo);
  socket.broadcast.in(room.getName()).emit(constants.IO_NEW_RANK, rankInfo);
  
  if(!disownerid) { return; }
  
  // Устанавливаем для ливишегося звания профиля активность на следещем из его званий
  var disownerProfile = oPool.profiles[disownerid];
  var ranks = room.getRanks().onGetRanksOfProfile(disownerid);
  disownerProfile.onSetActiveRank(null);
  if(ranks) {
    for(var item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
      var currRank = constants.RANKS[item];
      if(ranks[currRank] && ranks[currRank][PF.ISOWNER]) {
        disownerProfile.onSetActiveRank(currRank);
        break;
      }
    }
  } else {
    disownerProfile.onSetActiveRank(null);
  }
  
};
