/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Класс Плеер. Содержит треклист и предосатвляет инструменты для управления очередью треков и их оценки
 */

const addTrack              = require('./lib/add_track');
const deleteTrack           = require('./lib/delete_track');
const like                  = require('./lib/like');
const dislike               = require('./lib/dislike');
const getTrackTemp          = require('./lib/get_track_temp');
const deleteTrackOfUser     = require('./lib/delete_track_of_user');
const getLikes              = require('./lib/get_likes');
const getDislikes           = require('./lib/get_dislikes');
const checkTrack            = require('./lib/check_track');
const startTrack            = require('./lib/start_track');
const startTrackTimer       = require('./lib/start_track_timer');
const onAddTrack            = require('./lib/on_add_track');
const onAddTrackFree        = require('./lib/on_add_track_free');
const onDislikeTrack        = require('./lib/on_dislike_track');
const onGetFreeTrackState   = require('./lib/on_get_free_track_state');
const onGetLikersDislikers  = require('./lib/on_get_likers_dislikers');
const onGetTrackList        = require('./lib/on_get_track_list');
const onLikeTrack           = require('./lib/on_like_track');
const addEmits              = require('./lib/add_emits');
const deleteEmits           = require('./lib/delete_emits');

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
MusicPlayer.prototype.addEmits          = addEmits;
MusicPlayer.prototype.deleteEmits       = deleteEmits;

MusicPlayer.prototype.onAddTrack            = onAddTrack;
MusicPlayer.prototype.onAddTrackFree        = onAddTrackFree;
MusicPlayer.prototype.onDislikeTrack        = onDislikeTrack;
MusicPlayer.prototype.onGetFreeTrackState   = onGetFreeTrackState;
MusicPlayer.prototype.onGetLikersDislikers  = onGetLikersDislikers;
MusicPlayer.prototype.onGetTrackList        = onGetTrackList;
MusicPlayer.prototype.onLikeTrack           = onLikeTrack;

module.exports = MusicPlayer;