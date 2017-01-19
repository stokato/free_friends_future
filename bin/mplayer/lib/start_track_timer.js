/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Запускаем трек и таймер на переход к следующему
 */

const Config = require('../../../config.json');
const PF         = require('./../../const_fields');

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
  
  socket.emit(Config.io.emits.IO_GET_TRACK_LIST, res );
  socket.broadcast.in(room.getName()).emit(Config.io.emits.IO_GET_TRACK_LIST, res);
  
  res = {
    [PF.TRACK]       : track,
    [PF.PASSED_TIME] : 0
  };
  
  socket.emit(Config.io.emits.IO_START_TRACK, res);
  socket.broadcast.in(room.getName()).emit(Config.io.emits.IO_START_TRACK, res);
};