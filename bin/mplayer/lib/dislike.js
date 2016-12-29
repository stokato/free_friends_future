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
  let  tl = this._mTrackList;
  let  uid = profile.getID();
  
  for(let  i = 0; i < tl.length; i++) {
    
    if(tl[i].track_id == tid) {
      if(!this._mDislikers[tid][uid]) {
        tl[i].dislikes++;
        this._mDislikers[tid][uid] = { id : uid, vid : profile.getVID() };
      }
      
      if(this._mLikers[tid][uid]) {
        delete this._mLikers[tid][uid];
        tl[i].likes--;
        if(tl[i].likes < 0) {
          tl[i].likes = 0;
        }
      }
      return true;
    }
  }
  
  return false;
};