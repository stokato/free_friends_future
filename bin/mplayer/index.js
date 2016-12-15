/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Класс Плеер. Содержит треклист и предосатвляет инструменты для управления очередью треков и их оценки
 */

var addTrack      = require('./lib/add_track'),
    deleteTrack   = require('./lib/delete_track'),
    like          = require('./lib/like'),
    dislike       = require('./lib/dislike'),
    getTrackTemp  = require('./lib/get_track_temp'),
    deleteTrackOfUser = require('./lib/delete_track_of_user');

function MusicPlayer() {
  
  this._track_list = [];  // Трек-лист
  this._likers = {};      // Список с ид - пользователей, поставивших лайк
  this._dislikers = {};   // И дизлайк
  
  this._trackTime = null; // Время старта трека
  this._trackTimer = null; // Текущий таймер трека
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

MusicPlayer.prototype.setTimer = function (timer) {
  this._trackTimer = timer;
};

MusicPlayer.prototype.getTimer = function () {
  return this._trackTimer;
};

MusicPlayer.prototype.addTrack      = addTrack;
MusicPlayer.prototype.deleteTrack   = deleteTrack
MusicPlayer.prototype.deleteTrackOfUser = deleteTrackOfUser;
MusicPlayer.prototype.like          = like;
MusicPlayer.prototype.dislike       = dislike;
MusicPlayer.prototype.getTrackTemp  = getTrackTemp;

module.exports = MusicPlayer;