/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Возвращаем список тех, кто поставил лайк заданному треку
 *
 */

module.exports = function (tid) {
  
  let  likers = [];
  let  trackLikes = this._mLikers[tid] || {};
  
  for(let  item in trackLikes) if(trackLikes.hasOwnProperty(item)){
    likers.push(trackLikes[item]);
  }
  
  return likers;
};
