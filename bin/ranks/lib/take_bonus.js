/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Получаем бонус
 *
 */

module.exports = function (rank, uid) {
  
  if(!this._rRankOwners[uid]) { return false; }
  
  if(this._rBonuses[rank] > 0) {
    this._rBonuses --;
    
    return true;
  }
  
  return false;
};
