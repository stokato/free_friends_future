/**
 * Добавляем трек в очередь, отправляем в комнату обновленный трек-лист
 *
 * @param socket, options - объект с ид трека (из вк), callback
 *
 */

const Config  = require('./../../../config.json');
const PF      = require('./../../const_fields');
const oPool   = require('./../../objects_pool');
  
const emitRes = require('./../../emit_result');
const sanitize = require('./../../sanitize');

module.exports = function () {
  
  const EMIT    = Config.io.emits.IO_ADD_TRECK_FREE;
  const DJ_RANK = Config.ranks.dj.name;
  
  let self  = this;
  
  return function(socket, options) {
    if(!PF.TRACKID in options || !PF.DURATION in options) {
      return emitRes(Config.errors.NO_PARAMS, socket, EMIT);
    }
  
    options[PF.TRACKID] = sanitize(options[PF.TRACKID]);
    options[PF.DURATION] = sanitize(options[PF.DURATION]);
  
    let  selfProfile = oPool.userList[socket.id];
    let  room = oPool.roomList[socket.id];
  
    // Проверяем - есть ли такой трек в очереди
    for (let  i = 0; i < self._mTrackList.length; i++) {
      if (self._mTrackList[i][PF.TRACKID] == options[PF.TRACKID]) {
        return emitRes(Config.errors.ALREADY_IS_TRACK, socket, EMIT);
      }
    }
  
    // Проверяем - есть ли наш трек в очереди
    for (let i = 0; i < self._mTrackList.length; i++) {
      if (self._mTrackList[i][PF.ID] == selfProfile.getID()) {
        return emitRes(Config.errors.BLOCK_FREE_TRACK, socket, EMIT);
      }
    }
  
    let  trackObj = {
      [PF.TRACKID]  : options[PF.TRACKID],
      [PF.ID]       : selfProfile.getID(),
      [PF.VID]      : selfProfile.getVID(),
      [PF.LIKES]    : 0,
      [PF.DISLIKES] : 0,
      [PF.DURATION] : options[PF.DURATION]
    };
  
    // Если очередь пустая, запускаем сразу
    if (self._mTrackList.length == 0) {
      self.setTrackTime(new Date());
      self.startTrackTimer(socket, room, trackObj);
    }
    
    self.addTrack(trackObj);
  
    let  ranksCtrlr = oPool.roomList[socket.id].getRanks();
    ranksCtrlr.addRankBall(DJ_RANK, selfProfile.getID());
  
    res = { [PF.TRACKLIST] : self._mTrackList };
  
    socket.broadcast.in(room.getName()).emit(Config.io.emits.IO_GET_TRACK_LIST, res);
    socket.emit(Config.io.emits.IO_GET_TRACK_LIST, res);
    
    emitRes(null, socket, EMIT);
  
  }
};