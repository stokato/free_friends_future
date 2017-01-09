/**
 * Created by s.t.o.k.a.t.o on 25.11.2016.
 */
const async     =  require('async');

const constants  = require('../../../constants');
const oPool      = require('./../../../objects_pool'),
  handleError    = require('./../common/handle_error'),
  checkInput     = require('./../common/check__game_input');

const 
  addAction      = require('./../main/game_action'),
  releasePlayer  = require('./../main/release_player');

const emit = constants.IO_RELEASE_PLAYER;
const handler = releasePlayer;

// Назначаем эмиты
module.exports = function(socket) {
  
  addAction(socket);
  
  socket.on(emit, function(options) {
    
    let selfProfile = oPool.userList[socket.id];
    let game = selfProfile.getGame();
    
    async.waterfall([
      function (cb) { cb(null, emit, socket, game.getNextGame(), options); },
      checkInput,
      handler
    ],function (err, result) {
      if(err) { return handleError(socket, emit, game.getNextGame(), err); }

      result.operation_status = constants.RS_GOODSTATUS;
      socket.emit(constants.IO_RELEASE_PLAYER, result);
    });
  });
  
};