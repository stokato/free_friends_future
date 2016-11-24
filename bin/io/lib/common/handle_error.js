var constants  = require('./../../../constants');
var IOError = require('./io_error');

module.exports = function (socket, emit, err, res) { res = res || {};
  res.operation_status = constants.RS_BADSTATUS;
  res.operation_error = err.code || constants.errors.OTHER.code;
  
  socket.emit(emit, res);
  
  new IOError(emit, err.message || constants.errors.OTHER.message);
};