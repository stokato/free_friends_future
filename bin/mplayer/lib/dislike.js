/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Добавляем дизлайк к треку, если ранее пользователь ставил лайк, снимаем его.
 * Запрещаем ставить еще один дизлайк
 *
 * @param profile - профиль пользователя
 * @param tid - ид пользователя, ставящего дизлайк, tid - ид трека
 * @return {boolean} - признак - поставлен дизлайк или нет
 */

module.exports = function (profile, tid) {
  let  tlArr  = this._mTrackList;
  let  uid = profile.getID();
  let tlLen = tlArr.length;
  
  for(let  i = 0; i < tlLen; i++) {
    
    if(tlArr[i].track_id == tid) {
      if(!this._mDislikers[tid][uid]) {
        tlArr[i].dislikes++;
        this._mDislikers[tid][uid] = { id : uid, vid : profile.getVID() };
      }
      
      if(this._mLikers[tid][uid]) {
        delete this._mLikers[tid][uid];
        tlArr[i].likes--;
        if(tlArr[i].likes < 0) {
          tlArr[i].likes = 0;
        }
      }
      return true;
    }
  }
  
  return false;
};