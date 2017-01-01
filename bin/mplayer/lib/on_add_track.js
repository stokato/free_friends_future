/**
 * Добавляем трек в очередь, отправляем в комнату обновленный трек-лист
 *
 * @param socket, options - объект с ид трека (из вк), callback
 *
 */

const Config     = require('./../../../config.json');
const constants  = require('./../../constants');
const oPool      = require('./../../objects_pool');

const emitRes = require('./../../emit_result');
const sanitize = require('./../../sanitizer');

const PF            = constants.PFIELDS;
const TRACK_PRICE   = Number(Config.moneys.track_price);
const WASTE_POINTS  = Number(Config.points.waste);
const TRACK_POINTS  = Number(Config.points.music);
const EMIT = constants.IO_ADD_TRECK;

module.exports = function () {
  let self = this;
  
  return function(socket, options) {
    if(!PF.TRACKID in options || !PF.DURATION in options) {
      return emitRes(constants.errors.NO_PARAMS, socket, EMIT);
    }
  
    options[PF.TRACKID]  = sanitize(options[PF.TRACKID]);
    options[PF.DURATION] = sanitize(options[PF.DURATION]);
  
    let selfProfile = oPool.userList[socket.id];
    let room = oPool.roomList[socket.id];
  
    // Оплачиваем трек
    selfProfile.pay(TRACK_PRICE, function (err) {
      if(err) { return emitRes(err, socket, EMIT); }
    
      let wpoints = Math.floor(WASTE_POINTS * TRACK_PRICE);
    
      selfProfile.addPoints(wpoints, function (err) {
        if(err) { return emitRes(err, socket, EMIT); }
      
        let tpoints = Math.floor(TRACK_POINTS * TRACK_PRICE);
      
        selfProfile.addPoints(tpoints, function (err) {
          if(err) { return emitRes(err, socket, EMIT); }
        
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
          ranks.addRankBall(constants.RANKS.DJ, selfProfile.getID());
        
          let res = { [PF.TRACKLIST] : self._mTrackList };
        
          socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, res);
          socket.emit(constants.IO_GET_TRACK_LIST, res);
        
          emitRes(null, socket, EMIT);
        });
      
      });
    
    });
  
  }
};