/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Удаляем из очереди все треки пользователя
 */

module.exports = function (id) {
  var newTrackList = [];
  
  for (var i = 0; i < this._track_list.length; i++) {
    if (this._track_list[i].id == id) {
  
      var tid = this._track_list[i].track_id;
      delete this._likers[tid];
      delete this._dislikers[tid];
      
      // this._track_list.splice(i, 1);
    } else {
      newTrackList.push(this._track_list[i]);
    }
  }
  
  this._track_list = newTrackList;
};
