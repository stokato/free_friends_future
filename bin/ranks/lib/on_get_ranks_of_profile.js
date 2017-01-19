/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Получаем все ранги пользователя по его ИД
 */

const Config = require('./../../../config.json');
const oPool = require('./../../objects_pool');
const emitRes = require('./emit_result');

const RANKS = Config.ranks;
const ALMIGHTY = Config.almighty;

const PF = require('./../../const_fields');

module.exports = function () {
  let self = this;
  
  return function (socket, options) {
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    if(!self._rProfiles[uid]) {
      return null;
    }
  
    let ranks = {};
    let rOwner = 0;
    let rCount = 0;
  
    for(let item in RANKS) if(RANKS.hasOwnProperty(item)) {
      let rank = RANKS[item].name;
    
      let rankStart = Number(RANKS[rank].start);
      let rankStep = Number(RANKS[rank].step);
    
      let rankInfo = {};

      rCount ++;
      if(self._rRankOwners[rank] == uid) {
        rankInfo[PF.ISOWNER] = true;
        rOwner++;
      }

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
        rankInfo[PF.PROGRESS] = Math.floor(rankInfo[PF.BALLS] / rankInfo[PF.NEED_BALLS] * 100);
      }
    
      ranks[rank] = rankInfo;
    }
  
    ranks[PF.ACTIVE_RANK] = selfProfile.onGetActiveRank() || null;

    ranks[ALMIGHTY] = {};

    if(rOwner == rCount) {
      ranks[ALMIGHTY][PF.ISOWNER] = true;
    } else {
      ranks[ALMIGHTY][PF.NEED_BALLS] = rCount;
      ranks[ALMIGHTY][PF.BALLS] = rOwner;
      ranks[ALMIGHTY][PF.PROGRESS] = Math.floor(rOwner / rCount * 100);
    }
  
    emitRes(null, socket, Config.io.emits.IO_GET_RANKS, ranks);
  }
};



