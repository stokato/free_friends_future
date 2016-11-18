/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

/*
 Добавляем лайк к треку,
 если ранее пользователь ставил дизлайк, снимаем его.
 
 Запрещаем ставить еще один лайк
 */
module.exports = function (uid, tid) {
  var tl = this._track_list;
  
  for(var i = 0; i < tl.length; i++) {
    
    if(tl[i].track_id == tid) {
      if(!this._likers[tid][uid]) {
        tl[i].likes++;
        this._likers[tid][uid] = true;
      }
      
      if(this._dislikers[tid][uid]) {
        this._dislikers[tid][uid] = false;
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