/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Добавляем лайк к треку, если ранее пользователь ставил дизлайк, снимаем его.
 * Запрещаем ставить еще один лайк
 *
 * @param uid - ид пользователя, поставивешего лайк, tid - ид трека
 * @return {boolean} - признак - поставлен лайк или нет
 */

module.exports = function (profile, tid) {
  var tl = this._track_list;
  var uid = profile.getID();
  
  for(var i = 0; i < tl.length; i++) {
    
    if(tl[i].track_id == tid) {
      if(!this._likers[tid][uid]) {
        tl[i].likes++;
        this._likers[tid][uid] = { id : uid, vid : profile.getVID() };
      }
      
      if(this._dislikers[tid][uid]) {
        delete this._dislikers[tid][uid];
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