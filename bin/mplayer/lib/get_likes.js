/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Возвращаем список тех, кто поставил лайк заданному треку
 *
 */

module.exports = function (tid) {
  
  let  likesArr = [];
  let  trackLikesObj = this._mLikers[tid] || {};
  
  for(let  item in trackLikesObj) if(trackLikesObj.hasOwnProperty(item)){
    likesArr.push(trackLikesObj[item]);
  }
  
  return likesArr;
};
