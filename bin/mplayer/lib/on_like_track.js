/**
 * Добавляем лайк к треку, отправлюяем в комнату обновленный трек-лист
 *
 * @param socket, options - объект с ид трека, callback
 */

const constants = require('./../../constants');
const oPool     = require('./../../objects_pool');
const emitRes   = require('./../../emit_result');
const sanitize  = require('./../../sanitize');
const PF        = constants.PFIELDS;

module.exports = function () {
  let self = this;
  
  return function(socket, options) {
    if(!PF.TRACKID in options) {
      return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_LIKE_TRACK);
    }
  
    options[PF.TRACKID] = sanitize(options[PF.TRACKID]);
  
    let  room        = oPool.roomList[socket.id];
    let  selfProfile = oPool.userList[socket.id];
  
    let  trackID     = options[PF.TRACKID];
    let  isTrack     = self.like(selfProfile, trackID);
  
    if(!isTrack) { return emitRes(constants.errors.NO_SUCH_TRACK, socket, constants.IO_LIKE_TRACK) }
  
    let  res = { [PF.TRACKLIST] : self.getTrackList() };
  
    socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, res);
    socket.emit(constants.IO_GET_TRACK_LIST, res);
  
    res = {
      [PF.ID]  : selfProfile.getID(),
      [PF.VID] : selfProfile.getVID()
    };
  
    socket.broadcast.in(room.getName()).emit(constants.IO_LIKE_TRACK, res);
    emitRes(null, socket, constants.IO_LIKE_TRACK, res);
  }
};