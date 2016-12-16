/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Удаляем текущий трек из очереди и запускаем следующий
 */

var constants = require('./../../../constants'),
  PF        = constants.PFIELDS;

var startTrack = require('./start_track_timer');

module.exports = function (room, profile) {
  var mPlayer   = room.getMusicPlayer();
  var trackList = mPlayer.getTrackList();
  
  if(trackList.length == 0) { return; }
  
  if(profile.getID() == trackList[0][PF.ID]) {
  
    var socket = room.getAnySocket();
    
    clearTimeout(mPlayer.getTimer());
    // mPlayer.deleteTrack(trackList[0][PF.TRACKID]);
    mPlayer.deleteTrackOfUser(profile.getID());
    
    var info = {};
    info[PF.TRACK]        = trackList[0];
    socket.emit(constants.IO_STOP_TRACK, info);
    socket.broadcast.in(room.getName()).emit(constants.IO_STOP_TRACK, info);
    profile.getSocket().emit(constants.IO_STOP_TRACK, info);
  
    trackList = mPlayer.getTrackList();
    if(trackList.length > 0) {
      startTrack(socket, room, trackList[0]);
    } else {
      info = {};
      info[PF.TRACKLIST] = trackList;
    
      socket.emit(constants.IO_GET_TRACK_LIST, info );
      socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, info);
    }
  } else {
    mPlayer.deleteTrackOfUser(profile.getID());
  }
  
};