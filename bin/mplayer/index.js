/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

var addTrack      = require('./lib/add_track'),
    deleteTrack   = require('./lib/delete_track'),
    like          = require('./lib/like'),
    dislike       = require('./lib/dislike');

/*
    Класс плеера
 */
function MusicPlayer() {
  
  this._track_list = [];
  this._likers = {};
  this._dislikers = {};
  
  this._trackTime = null;
}

MusicPlayer.prototype.setTrackTime = function (time) {
  this._trackTime = time;
};

MusicPlayer.prototype.getTrackTime = function () {
  return this._trackTime;
};

MusicPlayer.prototype.getTrackList = function () {
  return this._track_list;
};

MusicPlayer.prototype.addTrack      = addTrack;
MusicPlayer.prototype.deleteTrack   = deleteTrack;
MusicPlayer.prototype.like          = like;
MusicPlayer.prototype.dislike       = dislike;

module.exports = MusicPlayer;