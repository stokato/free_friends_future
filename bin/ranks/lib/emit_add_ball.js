/**
 * Created by s.t.o.k.a.t.o on 30.12.2016.
 *
 * Реагируем на поулчение баллов уведомлением по званию, до которого ближе всего
 */

const Config    = require('./../../../config.json');
const PF        = require('./../../const_fields');
const oPool     = require('./../../objects_pool');

module.exports = function (uid) {
  
  const RANKS = Config.ranks;
  
  let ranksObj = {};

  for(let item in RANKS) if(RANKS.hasOwnProperty(item)) {
    let rankName = RANKS[item].name;
    
    let rankStart = Number(RANKS[rankName].start);
    let rankStep = Number(RANKS[rankName].step);
    
    let rankInfoObj = {};
    
    rankInfoObj[PF.RANK] = rankName;
    
    if(this._rRankOwners[rankName] != uid) {
      rankInfoObj[PF.BALLS] = this._rProfiles[uid][rankName];
      
      if(this._rRankOwners[rankName]) {
        rankInfoObj[PF.NEED_BALLS] = this._rProfiles[this._rRankOwners[rankName]][rankName] + rankStep;
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
    
    ranksObj[rankName] = rankInfoObj;
  }
  
  let targetRankKey = null;
  let maxProgress = 0;
  let ranksRandArr = [];
  
  for(let item in ranksObj) if(ranksObj.hasOwnProperty(item)) {
    if(ranksObj[item][PF.PROGRESS] > maxProgress) {
      targetRankKey  = item;
      maxProgress = ranksObj[item][PF.PROGRESS];
    }
    ranksRandArr.push(item);
  }
  
  if(!targetRankKey) {
    let rand = Math.floor(Math.random() * ranksRandArr.length);
    targetRankKey = ranksRandArr[rand];
  }
  
  let profile = oPool.profiles[uid];
  if(profile) {
    let socket = profile.getSocket();
    socket.emit(Config.io.emits.IO_ADD_BALLS, ranksObj[targetRankKey]);
  }
  
};
