/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Класс Плеер. Содержит треклист и предосатвляет инструменты для управления очередью треков и их оценки
 */

const addTrack              = require('./lib/add_track'),
      deleteTrack           = require('./lib/delete_track'),
      like                  = require('./lib/like'),
      dislike               = require('./lib/dislike'),
      getTrackTemp          = require('./lib/get_track_temp'),
      deleteTrackOfUser     = require('./lib/delete_track_of_user'),
      getLikes              = require('./lib/get_likes'),
      getDislikes           = require('./lib/get_dislikes'),
      checkTrack            = require('./lib/check_track'),
      startTrack            = require('./lib/start_track'),
      startTrackTimer       = require('./lib/start_track_timer'),
      onAddTrack            = require('./lib/on_add_track'),
      onAddTrackFree        = require('./lib/on_add_track_free'),
      onDislikeTrack        = require('./lib/on_dislike_track'),
      onGetFreeTrackState   = require('./lib/on_get_free_track_state'),
      onGetLikersDislikers  = require('./lib/on_get_likers_dislikers'),
      onGetTrackList        = require('./lib/on_get_track_list'),
      onLikeTrack           = require('./lib/on_like_track'),
      addProfile            = require('./lib/add_profile'),
      deleteProfile         = require('./lib/delete_profile');

function MusicPlayer() {
  
  this._mTrackList = [];  // Трек-лист
  this._mLikers = {};      // Список с ид - пользователей, поставивших лайк
  this._mDislikers = {};   // И дизлайк
  
  this._mTrackTime = null; // Время старта трека
  this._mTrackTimer = null; // Текущий таймер трека
}

MusicPlayer.prototype.setTrackTime      = function (time) {  this._mTrackTime = time; };
MusicPlayer.prototype.getTrackTime      = function () { return this._mTrackTime; };

MusicPlayer.prototype.getTrackList      = function () { return this._mTrackList; };

MusicPlayer.prototype.setTimer          = function (timer) { this._mTrackTimer = timer; };
MusicPlayer.prototype.getTimer          = function () { return this._mTrackTimer; };

MusicPlayer.prototype.addTrack          = addTrack;
MusicPlayer.prototype.deleteTrack       = deleteTrack;
MusicPlayer.prototype.deleteTrackOfUser = deleteTrackOfUser;
MusicPlayer.prototype.like              = like;
MusicPlayer.prototype.dislike           = dislike;
MusicPlayer.prototype.getTrackTemp      = getTrackTemp;
MusicPlayer.prototype.getLikes          = getLikes;
MusicPlayer.prototype.getDislikes       = getDislikes;

MusicPlayer.prototype.checkTrack        = checkTrack;
MusicPlayer.prototype.startTrack        = startTrack;
MusicPlayer.prototype.startTrackTimer   = startTrackTimer;
MusicPlayer.prototype.addProfile        = addProfile;
MusicPlayer.prototype.deleteProfile     = deleteProfile;

MusicPlayer.prototype.onAddTrack            = onAddTrack;
MusicPlayer.prototype.onAddTrackFree        = onAddTrackFree;
MusicPlayer.prototype.onDislikeTrack        = onDislikeTrack;
MusicPlayer.prototype.onGetFreeTrackState   = onGetFreeTrackState;
MusicPlayer.prototype.onGetLikersDislikers  = onGetLikersDislikers;
MusicPlayer.prototype.onGetTrackList        = onGetTrackList;
MusicPlayer.prototype.onLikeTrack           = onLikeTrack;

module.exports = MusicPlayer;