/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Добавляем дизлайк к треку, если ранее пользователь ставил лайк, снимаем его.
 * Запрещаем ставить еще один дизлайк
 *
 * @param uid - ид пользователя, ставящего дизлайк, tid - ид трека
 * @return {boolean} - признак - поставлен дизлайк или нет
 */

module.exports = function (profile, tid) {
  var tl = this._track_list;
  var uid = profile.getID();
  
  for(var i = 0; i < tl.length; i++) {
    
    if(tl[i].track_id == tid) {
      if(!this._dislikers[tid][uid]) {
        tl[i].dislikes++;
        this._dislikers[tid][uid] = { id : uid, vid : profile.getVID() };
      }
      
      if(this._likers[tid][uid]) {
        delete this._likers[tid][uid];
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