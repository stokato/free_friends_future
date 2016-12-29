/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Удаляем профиль
 */

const constants = require('./../../constants');
const ioc = require('./../../io_controller');

module.exports = function (profile) {
  let socket = profile.getSocket();
  
  ioc.removeEmit(socket, constants.IO_ADD_TRECK);
  ioc.removeEmit(socket, constants.IO_ADD_TRECK_FREE);
  ioc.removeEmit(socket, constants.IO_GET_FREE_TRACK_STATE);
  ioc.removeEmit(socket, constants.IO_LIKE_TRACK);
  ioc.removeEmit(socket, constants.IO_DISLIKE_TRACK);
  ioc.removeEmit(socket, constants.IO_GET_TRACK_LIST);
  ioc.removeEmit(socket, constants.IO_GET_LIKES_AND_DISLAKES);
};