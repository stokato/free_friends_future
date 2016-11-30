/**
 * Привязываем обработчик к эмиту
 *
 * @param socket, emit, handler, withoutStatus - флаг, не требуется отправлять ответ со статусом операции
 */

var async     =  require('async');

var constants     = require('../../../constants'),
  handleError     = require('../common/handle_error'),
  checkInput      = require('../common/check_input'),
  oPool = require('./../../../objects_pool');

/*
  Создает обработчик для указанного эмита, получает так же функцию, которая выполняется при срабатывании
 */
module.exports = function (socket, emit, handler, withoutStatus) {
  socket.on(emit, function(options) {
  
    async.waterfall(
      [
        function (cb) {  cb(null, emit, socket, options); },
        checkInput,
        handler
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

