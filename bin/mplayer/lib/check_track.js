/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Удаляем текущий трек из очереди и запускаем следующий
 */

const Config = require('../../../config.json');
const PF        = require('./../../const_fields');
const IO_STOP_TRACK = Config.io.emits.IO_STOP_TRACK;

module.exports = function (room, profile) {
  
  if(this._mTrackList.length == 0) { return; }
  
  if(profile.getID() == this._mTrackList[0][PF.ID]) {
  
    let  socket = room.getAnySocket();
    
    clearTimeout(this.getTimer());
    
    let  info = { [PF.TRACK] : this._mTrackList[0] };
    socket.emit(IO_STOP_TRACK, info);
    socket.broadcast.in(room.getName()).emit(IO_STOP_TRACK, info);
    profile.getSocket().emit(IO_STOP_TRACK, info);
    
    this.deleteTrackOfUser(profile.getID());
  
    this._mTrackList = this.getTrackList();
    if(this._mTrackList.length > 0) {
      
      this.startTrackTimer(socket, room, this._mTrackList[0]);
      
    } else {
      info = { [PF.TRACKLIST] : this._mTrackList };
    
      socket.emit(Config.io.emits.IO_GET_TRACK_LIST, info );
      socket.broadcast.in(room.getName()).emit(Config.io.emits.IO_GET_TRACK_LIST, info);
    }
  } else {
    
    this.deleteTrackOfUser(profile.getID());
  }
  
};