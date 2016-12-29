/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Получаем все ранги пользователя по его ИД
 */

const Config = require('./../../../config.json');
const constants = require('./../../constants');
const oPool = require('./../../objects_pool');
const emitRes = require('./emit_result');

const PF = constants.PFIELDS;

module.exports = function () {
  let self = this;
  
  return function (socket, options) {
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    if(!self._rProfiles[uid]) {
      return null;
    }
  
    let ranks = {};
  
    for(let item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
      let rank = constants.RANKS[item];
    
      let rankStart = Number(Config.ranks[rank].start);
      let rankStep = Number(Config.ranks[rank].step);
    
      let rankInfo = {};
    
      rankInfo[PF.ISOWNER] = (self._rRankOwners[rank] == uid);
    
      if(!rankInfo[PF.ISOWNER]) {
        rankInfo[PF.BALLS] = self._rProfiles[uid][rank];
      
        if(self._rRankOwners[rank]) {
          rankInfo[PF.NEED_BALLS] = self._rProfiles[self._rRankOwners[rank]][rank] + rankStep;
        } else {
        
          let needBalls = rankStart;
          if(needBalls <= rankInfo[PF.BALLS]) { // Если владевший званием ушел
            rankInfo[PF.NEED_BALLS] = needBalls + 1;
          } else {    // Если в конмте никто еще не присвоил звание
            rankInfo[PF.NEED_BALLS] = needBalls;
          }
        
        }
      }
    
      ranks[rank] = rankInfo;
    }
  
    ranks[constants.PFIELDS.ACTIVE_RANK] = selfProfile.onGetActiveRank() || null;
  
    emitRes(null, socket, constants.IO_GET_RANKS, ranks);
  }
};



