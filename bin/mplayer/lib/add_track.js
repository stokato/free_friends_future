/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Добавляем трек в трек-лист
 *
 * @param track
 */

module.exports = function (track, atfirst) {
  
  if(!atfirst) {
    this._track_list.push(track);
  } else {
    this._track_list.unshift(track);
  }
  
  this._likers[track.track_id]    = {};
  this._dislikers[track.track_id] = {};
};