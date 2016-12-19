/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Возвращаем список тех, кто поставил лайк заданному треку
 *
 */

module.exports = function (tid) {
  
  var likers = [];
  var trackLikes = this._likers[tid] || {};
  
  for(var item in trackLikes) if(trackLikes.hasOwnProperty(item)){
    likers.push(trackLikes[item]);
  }
  
  return likers;
};
