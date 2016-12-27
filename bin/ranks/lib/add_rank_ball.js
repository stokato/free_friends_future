/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем новый бал к счетчику званий,
 * проверяем - достигнуто ли звание
 */

const Config = require('./../../../config.json');

module.exports = function (rank, uid) {
  if(!this._profiles[uid]) {
    return this._onRank(new Error("No profile with such id"), null);
  }
  
  this._profiles[uid][rank]++;
  
  let rankStart = Number(Config.ranks[rank].start);
  let rankStep  = Number(Config.ranks[rank].step);;
  
  if(!this._rankOwners[rank]) {
    if (this._profiles[uid][rank] >= rankStart) {
      this._rankOwners[rank] = uid;
      
      this.onNewRank(null, rank, uid, null);
      this.awardProfile(rank, uid);
    }
  } else  {
    let currOwnerID   = this._rankOwners[rank];
    let currOwnerBall = this._profiles[currOwnerID][rank];
    
    let dStep = this._profiles[uid][rank] - rankStep;
    if (dStep >= currOwnerBall) {
      this._rankOwners[rank] = uid;
  
      this.onNewRank(null, rank, uid, currOwnerID);
      this.awardProfile(rank, uid);
    }
  }
  
};
