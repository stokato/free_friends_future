/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Получаем все ранги пользователя по его ИД
 */

const Config  = require('./../../../config.json');
const PF      = require('./../../const_fields');
const oPool   = require('./../../objects_pool');
const emitRes = require('./../../emit_result');

module.exports = function () {
  
  const RANKS = Config.ranks;
  const ALMIGHTY = Config.almighty;
  
  let self = this;
  
  return function (socket, options) {
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    if(!self._rProfiles[uid]) {
      return null;
    }
  
    let ranksObj = {};
    let ownBallCount = 0;
    let neeBallCount = 0;
  
    for(let item in RANKS) if(RANKS.hasOwnProperty(item)) {
      let rank = RANKS[item].name;
    
      let rankStart = Number(RANKS[rank].start);
      let rankStep  = Number(RANKS[rank].step);
    
      let rankInfoObj = {};

      neeBallCount ++;
      if(self._rRankOwners[rank] == uid) {
        rankInfoObj[PF.ISOWNER] = true;
        ownBallCount++;
      }

      if(!rankInfoObj[PF.ISOWNER]) {
        rankInfoObj[PF.BALLS] = self._rProfiles[uid][rank];
      
        if(self._rRankOwners[rank]) {
          rankInfoObj[PF.NEED_BALLS] = self._rProfiles[self._rRankOwners[rank]][rank] + rankStep;
        } else {
        
          let needBalls = rankStart;
          if(needBalls <= rankInfoObj[PF.BALLS]) { // Если владевший званием ушел
            rankInfoObj[PF.NEED_BALLS] = needBalls + 1;
          } else {    // Если в конмте никто еще не присвоил звание
            rankInfoObj[PF.NEED_BALLS] = needBalls;
          }
        
        }
        rankInfoObj[PF.PROGRESS] = Math.floor(rankInfoObj[PF.BALLS] / rankInfoObj[PF.NEED_BALLS] * 100);
      }
    
      ranksObj[rank] = rankInfoObj;
    }
  
    ranksObj[PF.ACTIVE_RANK] = selfProfile.onGetActiveRank() || null;

    ranksObj[ALMIGHTY] = {};

    if(ownBallCount == neeBallCount) {
      ranksObj[ALMIGHTY][PF.ISOWNER] = true;
    } else {
      ranksObj[ALMIGHTY][PF.NEED_BALLS] = neeBallCount;
      ranksObj[ALMIGHTY][PF.BALLS] = ownBallCount;
      ranksObj[ALMIGHTY][PF.PROGRESS] = Math.floor(ownBallCount / neeBallCount * 100);
    }
  
    emitRes(null, socket, Config.io.emits.IO_GET_RANKS, ranksObj);
  }
};



