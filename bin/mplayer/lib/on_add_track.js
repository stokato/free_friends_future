/**
 * Добавляем трек в очередь, отправляем в комнату обновленный трек-лист
 *
 * @param socket, options - объект с ид трека (из вк), callback
 *
 */

const Config     = require('./../../../config.json');
const oPool      = require('./../../objects_pool');

const emitRes = require('./../../emit_result');
const sanitize = require('./../../sanitize');

const PF            = require('./../../const_fields');
const TRACK_PRICE   = Number(Config.moneys.track_price);
const WASTE_POINTS  = Number(Config.points.waste);
const TRACK_POINTS  = Number(Config.points.music);
const IO_ADD_TRECK = Config.io.emits.IO_ADD_TRECK;
const DJ_RUNK = Config.ranks.dj.name;

module.exports = function () {
  let self = this;
  
  return function(socket, options) {
    if(!PF.TRACKID in options || !PF.DURATION in options) {
      return emitRes(Config.errors.NO_PARAMS, socket, IO_ADD_TRECK);
    }
  
    options[PF.TRACKID]  = sanitize(options[PF.TRACKID]);
    options[PF.DURATION] = sanitize(options[PF.DURATION]);
  
    let selfProfile = oPool.userList[socket.id];
    let room = oPool.roomList[socket.id];
  
    // Оплачиваем трек
    selfProfile.pay(TRACK_PRICE, function (err) {
      if(err) { return emitRes(err, socket, IO_ADD_TRECK); }
    
      let wpoints = Math.floor(WASTE_POINTS * TRACK_PRICE);
    
      selfProfile.addPoints(wpoints, function (err) {
        if(err) { return emitRes(err, socket, IO_ADD_TRECK); }
      
        let tpoints = Math.floor(TRACK_POINTS * TRACK_PRICE);
      
        selfProfile.addPoints(tpoints, function (err) {
          if(err) { return emitRes(err, socket, IO_ADD_TRECK); }
        
          let track = {
            [PF.TRACKID]  : options[PF.TRACKID],
            [PF.ID]       : selfProfile.getID(),
            [PF.VID]      : selfProfile.getVID(),
            [PF.LIKES]    : 0,
            [PF.DISLIKES] : 0,
            [PF.DURATION] : options[PF.DURATION]
          };
          
          self.startTrackTimer(socket, room, track);
          
          if(self._mTrackList.length > 0){
            self.deleteTrack(self._mTrackList[0][PF.TRACKID]);
          }
          
          self.addTrack(track, true);
        
          let ranks = oPool.roomList[socket.id].getRanks();
          ranks.addRankBall(DJ_RUNK, selfProfile.getID());
        
          let res = { [PF.TRACKLIST] : self._mTrackList };
        
          socket.broadcast.in(room.getName()).emit(Config.io.emits.IO_GET_TRACK_LIST, res);
          socket.emit(Config.io.emits.io.emits.IO_GET_TRACK_LIST, res);
        
          emitRes(null, socket, IO_ADD_TRECK);
        });
      
      });
    
    });
  
  }
};