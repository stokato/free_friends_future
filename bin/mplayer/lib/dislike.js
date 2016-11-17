/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

/*
    Добавляем дизлайк к треку,
      если ранее пользователь ставил лайк, снимаем его.
     
    Запрещаем ставить еще один дизлайк
 */
module.exports = function (uid, tid) {
  var tl = this._track_list;
  
  for(var i = 0; i < tl.length; i++) {
    
    if(tl[i].track_id == tid) {
      if(!this._dislikers[tid][uid]) {
        tl[i].dislikes++;
        this._dislikers[tid][uid] = true;
      }
      
      if(this._likers[tid][uid]) {
        this._likers[tid][uid] = false;
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