/**
 * Получаем трек-лист
 *
 * @param socket, options, callback
 * @return trackList - очередь треков для этой комнаты
 */

const Config    = require('./../../../config.json');
const PF        = require('./../../const_fields');

const emitRes = require('./../../emit_result');

module.exports = function () {
  let self = this;
  return function(socket, options) {
      
    emitRes(null, socket, Config.io.emits.IO_GET_TRACK_LIST, { [PF.TRACKLIST] : self._mTrackList });
  
  }
};