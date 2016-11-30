/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Удаляем трек из трек-листа
 *
 * @param tid - ид трека
 */

module.exports = function (tid) {
  for (var i = 0; i < this._track_list.length; i++) {
    if (this._track_list[i].track_id == tid) {
      this._track_list.splice(i, 1);
      break;
    }
  }
  
  delete this._likers[tid];
  delete this._dislikers[tid];
};