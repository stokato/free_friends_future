/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Удаляем трек из трек-листа
 *
 * @param tid - ид трека
 */

module.exports = function (tid) {
  for (let i = 0; i < this._mTrackList.length; i++) {
    if (this._mTrackList[i].track_id == tid) {
      this._mTrackList.splice(i, 1);
      break;
    }
  }
  
  delete this._mLikers[tid];
  delete this._mDislikers[tid];
};