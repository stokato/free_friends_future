/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Добавляем трек в трек-лист
 *
 * @param track
 * @param first
 */

module.exports = function (track, first = false) {
  
  if(!first) {
    this._mTrackList.push(track);
  } else {
    this._mTrackList.unshift(track);
  }
  
  this._mLikers[track.track_id]    = {};
  this._mDislikers[track.track_id] = {};
};