/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем профиль к списку
 */

const Config = require('./../../../config.json');
const ioc = require('./../../io_controller');

const EMITS = Config.io.emits;

module.exports = function (socket) {
  
  ioc.setEmit(socket, EMITS.IO_ADD_TRECK, this.onAddTrack());
  ioc.setEmit(socket, EMITS.IO_ADD_TRECK_FREE, this.onAddTrackFree());
  ioc.setEmit(socket, EMITS.IO_GET_FREE_TRACK_STATE, this.onGetFreeTrackState());
  ioc.setEmit(socket, EMITS.IO_LIKE_TRACK, this.onLikeTrack());
  ioc.setEmit(socket, EMITS.IO_DISLIKE_TRACK, this.onDislikeTrack());
  ioc.setEmit(socket, EMITS.IO_GET_TRACK_LIST, this.onGetTrackList());
  ioc.setEmit(socket, EMITS.IO_GET_LIKES_AND_DISLAKES, this.onGetLikersDislikers());
};