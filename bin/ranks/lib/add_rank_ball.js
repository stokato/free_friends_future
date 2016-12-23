/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем новый бал к счетчику званий,
 * проверяем - достигнуто ли звание
 */

var Config = require('./../../../config.json');

module.exports = function (rank, uid) {
  if(!this._profiles[uid]) {
    return this._onRank(new Error("No profile with such id"), null);
  }
  
  this._profiles[uid][rank]++;
  
  var rankStart = Number(Config.ranks[rank].start);
  var rankStep  = Number(Config.ranks[rank].step);;
  
  if(!this._rankOwners[rank]) {
    if (this._profiles[uid][rank] >= rankStart) {
      this._rankOwners[rank] = uid;
      
      this._onRank(null, rank, uid, null);
      this.awardProfile(rank, uid);
    }
  } else  {
    var currOwnerID   = this._rankOwners[rank];
    var currOwnerBall = this._profiles[currOwnerID][rank];
    
    var dStep = this._profiles[uid][rank] - rankStep;
    if (dStep >= currOwnerBall) {
      this._rankOwners[rank] = uid;
  
      this._onRank(null, rank, uid, currOwnerID);
      this.awardProfile(rank, uid);
    }
  }
  
};
