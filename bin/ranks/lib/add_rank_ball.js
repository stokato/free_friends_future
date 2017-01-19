/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем новый бал к счетчику званий,
 * проверяем - достигнуто ли звание
 */

const Config = require('./../../../config.json');
const ALMIGHTY_RANK = Config.almighty;

module.exports = function (rank, uid) {
  if(!this._rProfiles[uid]) {
    return this.onNewRank(new Error("No profile with such id"), null);
  }
  
  this._rProfiles[uid][rank]++;
  
  let rankStart = Number(Config.ranks[rank].start);
  let rankStep  = Number(Config.ranks[rank].step);
  
  if(!this._rRankOwners[rank]) {
    if (this._rProfiles[uid][rank] >= rankStart) {
      this._rRankOwners[rank] = uid;
      
      this.onNewRank(null, rank, uid, null);
      this.awardProfile(rank, uid);
    }
  } else  {
    let currOwnerID   = this._rRankOwners[rank];
    let currOwnerBall = this._rProfiles[currOwnerID][rank];
    
    let dStep = this._rProfiles[uid][rank] - rankStep;
    if (dStep >= currOwnerBall) {
      this._rRankOwners[rank] = uid;
  
      this.onNewRank(null, rank, uid, currOwnerID);
      this.awardProfile(rank, uid);

      if(this._rRankOwners[ALMIGHTY_RANK == currOwnerID]) {
        this._rRankOwners[ALMIGHTY_RANK] = null;
      }
    }
  }
  
  this.emitAddBall(uid);

  this.checkAlmighty(uid);
};
