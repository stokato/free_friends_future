/**
 * Created by s.t.o.k.a.t.o on 25.11.2016.
 */
var async     =  require('async');

var constants     = require('../../../constants');
var oPool = require('./../../../objects_pool'),
  handleError     = require('./../common/handle_error'),
  checkInput      = require('./../common/check__game_input');

var
  addAction           = require('./../main/game_action'),
  releasePlayer       = require('./../main/release_player');

var emit = constants.IO_RELEASE_PLAYER;
var handler = releasePlayer;

// Назначаем эмиты
module.exports = function(socket) {
  
  addAction(socket);
  
  socket.on(emit, function(options) {
    
    var selfProfile = oPool.userList[socket.id];
    var game = selfProfile.getGame();
    
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