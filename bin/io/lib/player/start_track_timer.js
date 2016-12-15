/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Запускаем трек и таймер на переход к следующему
 */

var constants  = require('./../../../constants'),
  PF         = constants.PFIELDS;

module.exports = function startTrack(socket, room, track, timerID) { timerID = timerID || null;
  var mPlayer = room.getMusicPlayer();
  
  mPlayer.setTrackTime(new Date());
  var trackList = mPlayer.getTrackList();
  
  timerID = setTimeout(function () {
    mPlayer.deleteTrack(track[PF.TRACKID]);
    
    if (trackList.length > 0) {
      var newTrack = trackList[0];
      startTrack(socket, room, newTrack, timerID);
    }
    
  }, track[PF.DURATION] * 1000);
  
  mPlayer.setTimer(timerID);
  
  var res = {};
  res[PF.TRACK]       = track;
  res[PF.PASSED_TIME] = 0;
  
  socket.emit(constants.IO_START_TRACK, res);
  socket.broadcast.in(room.getName()).emit(constants.IO_START_TRACK, res);
  
  res = {};
  res[PF.TRACKLIST] = trackList;
  
  socket.emit(constants.IO_GET_TRACK_LIST, res );
  socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, res);
};