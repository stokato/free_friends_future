/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Получаем бонус
 *
 */

module.exports = function (rank, uid) {
  
  if(!this._rankOwners[uid]) { return false; }
  
  if(this._bonuses[rank] > 0) {
    this._bonuses --;
    
    return true;
  }
  
  return false;
};
