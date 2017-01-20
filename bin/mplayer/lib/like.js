/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Добавляем лайк к треку, если ранее пользователь ставил дизлайк, снимаем его.
 * Запрещаем ставить еще один лайк
 *
 * @param profile - профиль пользователя
 * @param  tid - ид трека
 * @return {boolean} - признак - поставлен лайк или нет
 */

module.exports = function (profile, tid) {
  let tlArr = this._mTrackList;
  let uid   = profile.getID();
  let tlLen = tlArr.length;
  
  for(var i = 0; i < tlLen; i++) {
    
    if(tlArr[i].track_id == tid) {
      if(!this._mLikers[tid][uid]) {
        tlArr[i].likes++;
        this._mLikers[tid][uid] = { id : uid, vid : profile.getVID() };
      }
      
      if(this._mDislikers[tid][uid]) {
        delete this._mDislikers[tid][uid];
        tlArr[i].dislikes--;
        if(tlArr[i].dislikes < 0) {
          tlArr[i].dislikes = 0;
        }
      }
      
      return true;
    }
  }
  
  return false;
};