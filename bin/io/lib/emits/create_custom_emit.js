var async     =  require('async');

// Свои модули
var constants     = require('../../../constants'),
  handleError     = require('../../../handle_error'),
  checkInput      = require('../../../check_input');

/*
  Создаеть обработчик для указанного эмита, получает так же функцию, которая выполняется при срабатывании
 */
module.exports = function (socket, emit, handler, withoutStatus) {
  socket.on(emit, function(options) {
  
    async.waterfall(
      [
        function (cb) {  cb(null, emit, socket, options); },
        checkInput,
        handler,
      ],
      function(err, result) { result = result || {};
        if(err) { return handleError(socket, emit, err); }
      
        if(!withoutStatus) {
          result.operation_status = constants.RS_GOODSTATUS;
  
          socket.emit(emit, result);
        }
      });
    
  });
};
