/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Удаляем профиль
 */

const Config = require('./../../../config.json');
const ioc = require('./../../io_controller');

const EMITS = Config.io.emits;

module.exports = function (socket) {
  ioc.removeEmit(socket, EMITS.IO_ADD_TRECK);
  ioc.removeEmit(socket, EMITS.IO_ADD_TRECK_FREE);
  ioc.removeEmit(socket, EMITS.IO_GET_FREE_TRACK_STATE);
  ioc.removeEmit(socket, EMITS.IO_LIKE_TRACK);
  ioc.removeEmit(socket, EMITS.IO_DISLIKE_TRACK);
  ioc.removeEmit(socket, EMITS.IO_GET_TRACK_LIST);
  ioc.removeEmit(socket, EMITS.IO_GET_LIKES_AND_DISLAKES);
};