/**
 * Получаем трек-лист
 *
 * @param socket, options, callback
 * @return trackList - очередь треков для этой комнаты
 */

const oPool     = require('./../../objects_pool');
const constants = require('./../../constants');
const PF        = constants.PFIELDS;

const emitRes = require('./../../emit_result');

module.exports = function () {
  let self = this;
  return function(socket, options) {
      
    emitRes(null, socket, constants.IO_GET_TRACK_LIST, { [PF.TRACKLIST] : self._mTrackList });
  
  }
};