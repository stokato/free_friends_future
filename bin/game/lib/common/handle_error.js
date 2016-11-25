var constants  = require('./../../../constants');
var GameError = require('./game_error');

module.exports = function (socket, emit, nextGame, err, res) { res = res || {};
  res.operation_status = constants.RS_BADSTATUS;
  res.operation_error = err.code || constants.errors.OTHER.code;
  
  if(emit == constants.IO_GAME) {
    emit = constants.IO_GAME_ERROR;
  } else {
    nextGame = emit;
  }
  
  socket.emit(emit, res);
  
  new GameError(nextGame, err.message || constants.errors.OTHER.message);
};