/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем профиль к списку
 */

const constants = require('./../../constants');
const ioc = require('./../../io_controller');

module.exports = function (socket) {
  
  ioc.setEmit(socket, constants.IO_ADD_TRECK, this.onAddTrack());
  ioc.setEmit(socket, constants.IO_ADD_TRECK_FREE, this.onAddTrackFree());
  ioc.setEmit(socket, constants.IO_GET_FREE_TRACK_STATE, this.onGetFreeTrackState());
  ioc.setEmit(socket, constants.IO_LIKE_TRACK, this.onLikeTrack());
  ioc.setEmit(socket, constants.IO_DISLIKE_TRACK, this.onDislikeTrack());
  ioc.setEmit(socket, constants.IO_GET_TRACK_LIST, this.onGetTrackList());
  ioc.setEmit(socket, constants.IO_GET_LIKES_AND_DISLAKES, this.onGetLikersDislikers());
};