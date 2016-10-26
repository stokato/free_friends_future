var constants  = require('./constants');
var GameError = require('./game_error');

module.exports = function (socket, emit, err, res) { res = res || {};
  res.operation_status = constants.RS_BADSTATUS;
  res.operation_error = err.code || constants.errors.OTHER.code;
  
  if(emit == constants.IO_GAME) {
    emit = constants.IO_GAME_ERROR;
  }
  
  socket.emit(emit, res);
  
  new GameError(emit, err.message || constants.errors.OTHER.message);
};