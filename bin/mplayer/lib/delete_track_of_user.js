/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Удаляем из очереди все треки пользователя
 */

module.exports = function (id) {
  let  newTrackList = [];
  
  for (let  i = 0; i < this._mTrackList.length; i++) {
    if (this._mTrackList[i].id == id) {
  
      let  tid = this._mTrackList[i].track_id;
      delete this._mLikers[tid];
      delete this._mDislikers[tid];
      
    } else {
      newTrackList.push(this._mTrackList[i]);
    }
  }
  
  this._mTrackList = newTrackList;
};
