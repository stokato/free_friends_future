/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Запускаем трек и таймер на переход к следующему
 */

const constants  = require('./../../constants');
const PF         = constants.PFIELDS;

module.exports = function startTrack(socket, room, track, timerID) { timerID = timerID || null;
  let  self = this;

  let  oldTimer = this.getTimer();
  clearTimeout(oldTimer);
  
  this.setTrackTime(new Date());
  let  trackList = this.getTrackList();
  
  timerID = setTimeout(function () {
    self.deleteTrack(track[PF.TRACKID]);
    
    if (trackList.length > 0) {
      let  newTrack = trackList[0];
      self.startTrackTimer(socket, room, newTrack, timerID);
    }
    
  }, track[PF.DURATION] * 1000);
  
  this.setTimer(timerID);
  
  let  res = { [PF.TRACKLIST] : trackList };
  
  socket.emit(constants.IO_GET_TRACK_LIST, res );
  socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, res);
  
  res = {
    [PF.TRACK]       : track,
    [PF.PASSED_TIME] : 0
  };
  
  socket.emit(constants.IO_START_TRACK, res);
  socket.broadcast.in(room.getName()).emit(constants.IO_START_TRACK, res);
};