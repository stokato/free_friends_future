/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Возвращаем список тек, кто поставил дизлайк
 *
 */

module.exports = function (tid) {
  
  let  dislikers = [];
  let  trackDislikes = this._mDislikers[tid] || {};
  
  for(let  item in trackDislikes) if(trackDislikes.hasOwnProperty(item)){
    dislikers.push(trackDislikes[item]);
  }
  
  return dislikers;
};

