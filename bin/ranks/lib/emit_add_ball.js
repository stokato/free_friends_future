/**
 * Created by s.t.o.k.a.t.o on 30.12.2016.
 *
 * Реагируем на поулчение баллов уведомлением по званию, до которого ближе всего
 */

const Config    = require('./../../../config.json');
const oPool     = require('./../../objects_pool');

const RANKS = Config.ranks;
const ALMIGHTY = Config.almighty;

const PF = require('./../../const_fields');

module.exports = function (uid) {

  let ranks = {};

  for(let item in RANKS) if(RANKS.hasOwnProperty(item)) {
    let rank = RANKS[item].name;
    
    let rankStart = Number(RANKS[rank].start);
    let rankStep = Number(RANKS[rank].step);
    
    let rankInfo = {};
    
    rankInfo[PF.RANK] = rank;
    
    if(this._rRankOwners[rank] != uid) {
      rankInfo[PF.BALLS] = this._rProfiles[uid][rank];
      
      if(this._rRankOwners[rank]) {
        rankInfo[PF.NEED_BALLS] = this._rProfiles[this._rRankOwners[rank]][rank] + rankStep;
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
  
  let targetRank = null;
  let maxProgress = 0;
  let ranksRand = [];
  
  for(let item in ranks) if(ranks.hasOwnProperty(item)) {
    if(ranks[item][PF.PROGRESS] > maxProgress) {
      targetRank  = item;
      maxProgress = ranks[item][PF.PROGRESS];
    }
    ranksRand.push(item);
  }
  
  if(!targetRank) {
    let rand = Math.floor(Math.random() * ranksRand.length);
    targetRank = ranksRand[rand];
  }
  
  let profile = oPool.profiles[uid];
  if(profile) {
    let socket = profile.getSocket();
    socket.emit(Config.io.emits.IO_ADD_BALLS, ranks[targetRank]);
  }
  
};
