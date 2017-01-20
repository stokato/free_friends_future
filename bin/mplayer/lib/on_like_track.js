/**
 * Добавляем лайк к треку, отправлюяем в комнату обновленный трек-лист
 *
 * @param socket, options - объект с ид трека, callback
 */

const Config    = require('./../../../config.json');
const oPool     = require('./../../objects_pool');
const emitRes   = require('./../../emit_result');
const sanitize  = require('./../../sanitize');
const PF        = require('./../../const_fields');

module.exports = function () {
  
  const IO_LIKE_TRACK = Config.io.emits.IO_LIKE_TRACK;
  
  let self = this;
  
  return function(socket, options) {
    if(!PF.TRACKID in options) {
      return emitRes(Config.errors.NO_PARAMS, socket, IO_LIKE_TRACK);
    }
  
    options[PF.TRACKID] = sanitize(options[PF.TRACKID]);
  
    let  room        = oPool.roomList[socket.id];
    let  selfProfile = oPool.userList[socket.id];
  
    let  trackID     = options[PF.TRACKID];
    let  isTrack     = self.like(selfProfile, trackID);
  
    if(!isTrack) { return emitRes(Config.errors.NO_SUCH_TRACK, socket, IO_LIKE_TRACK) }
  
    let  resObj = { [PF.TRACKLIST] : self.getTrackList() };
  
    socket.broadcast.in(room.getName()).emit(Config.io.emits.IO_GET_TRACK_LIST, resObj);
    socket.emit(Config.io.emits.IO_GET_TRACK_LIST, resObj);
  
    resObj = {
      [PF.ID]  : selfProfile.getID(),
      [PF.VID] : selfProfile.getVID()
    };
  
    socket.broadcast.in(room.getName()).emit(IO_LIKE_TRACK, resObj);
    emitRes(null, socket, IO_LIKE_TRACK, resObj);
  }
};