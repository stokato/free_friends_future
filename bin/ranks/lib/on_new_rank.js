/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем балл к званию
 */

const logger    = require('./../../../lib/log')(module);
const constants = require('./../../constants');
const oPool     = require('./../../objects_pool');
const PF        = constants.PFIELDS;

module.exports = function (err, rank, ownerid, disownerid) {
  if(err) { logger.error('handleRank: ' + err); }
  
  let  ownerProfile = oPool.profiles[ownerid];
  let  socket = ownerProfile.getSocket();
  let  room = oPool.roomList[socket.id];
  
  ownerProfile.onSetActiveRank(rank);
  
  let  rankInfo = {
    [PF.RANK] : rank,
    [PF.ID]   : ownerProfile.getID(),
    [PF.VID]  : ownerProfile.getVID()
  };
  
  socket.emit(constants.IO_NEW_RANK, rankInfo);
  socket.broadcast.in(room.getName()).emit(constants.IO_NEW_RANK, rankInfo);
  
  if(!disownerid) { return; }
  
  // Устанавливаем для ливишегося звания профиля активность на следещем из его званий
  let  disownerProfile = oPool.profiles[disownerid];
  let  ranks = room.getRanks().onGetRanksOfProfile(disownerid);
  disownerProfile.onSetActiveRank(null);
  if(ranks) {
    for(let  item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
      let  currRank = constants.RANKS[item];
      if(ranks[currRank] && ranks[currRank][PF.ISOWNER]) {
        disownerProfile.onSetActiveRank(currRank);
        break;
      }
    }
  } else {
    disownerProfile.onSetActiveRank(null);
  }
  
};
