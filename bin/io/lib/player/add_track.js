/**
 * Добавляем трек в очередь, отправляем в комнату обновленный трек-лист
 *
 * @param socket, options - объект с ид трека (из вк), callback
 *
 */
const Config        = require('./../../../../config.json');
const constants  = require('./../../../constants'),
    PF         = constants.PFIELDS,
    oPool      = require('./../../../objects_pool');

const startTrack = require('./start_track_timer');
const emitRes = require('./../../../emit_result');

const TRACK_PRICE = Config.moneys.track_price;

const WASTE_POINTS  = Number(Config.points.waste);
const TRACK_POINTS  = Number(Config.points.music);
const EMIT = constants.IO_ADD_TRECK;

module.exports = function () {
  let self = this;
  
  return function(socket, options) {
  
    let selfProfile = oPool.userList[socket.id];
    let room = oPool.roomList[socket.id];
  
    // Оплачиваем трек
    selfProfile.pay(TRACK_PRICE, function (err, money) {
      if(err) { return emitRes(err, socket, EMIT); }
    
      let wpoints = Math.floor(WASTE_POINTS * TRACK_PRICE);
    
      selfProfile.addPoints(wpoints, function (err, points) {
        if(err) { return emitRes(err, socket, EMIT); }
      
        let tpoints = Math.floor(TRACK_POINTS * TRACK_PRICE);
      
        selfProfile.addPoints(tpoints, function (err, points) {
          if(err) { return emitRes(err, socket, EMIT); }
        
          let track = {
            [PF.TRACKID]  : options[PF.TRACKID],
            [PF.ID]       : selfProfile.getID(),
            [PF.VID]      : selfProfile.getVID(),
            [PF.LIKES]    : 0,
            [PF.DISLIKES] : 0,
            [PF.DURATION] : options[PF.DURATION]
          };
        
          startTrack(socket, room, track);
          
          if(self._track_list.length > 0){
            self.deleteTrack(self._track_list[0][PF.TRACKID]);
          }
         
          self._track_list.unshift(track);
          self._likers[track.track_id]    = {};
          self._dislikers[track.track_id] = {};
        
          let ranks = oPool.roomList[socket.id].getRanks();
          ranks.addRankBall(constants.RANKS.DJ, selfProfile.getID());
        
          res = {
            [PF.TRACKLIST] : self._track_list
          };
        
          socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, res);
          socket.emit(constants.IO_GET_TRACK_LIST, res);
        
          emitRes(null, socket, EMIT);
        });
      
      });
    
    });
  
  }
};