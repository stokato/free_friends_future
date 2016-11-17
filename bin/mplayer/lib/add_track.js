/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

/*
    Добавляем трек в трек-лист
 */
module.exports = function (track) {
  
  this._track_list.push(track);
  
  this._likers[track.track_id] = {};
  this._dislikers[track.track_id] = {};
  
};