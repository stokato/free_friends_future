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
  var tl = this._mTrackList;
  var uid = profile.getID();
  
  for(var i = 0; i < tl.length; i++) {
    
    if(tl[i].track_id == tid) {
      if(!this._mLikers[tid][uid]) {
        tl[i].likes++;
        this._mLikers[tid][uid] = { id : uid, vid : profile.getVID() };
      }
      
      if(this._mDislikers[tid][uid]) {
        delete this._mDislikers[tid][uid];
        tl[i].dislikes--;
        if(tl[i].dislikes < 0) {
          tl[i].dislikes = 0;
        }
      }
      
      return true;
    }
  }
  
  return false;
};