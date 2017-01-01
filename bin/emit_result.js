/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Обрабатываем результат
 */

const constants  = require('./constants');
const logger = require('./../lib/log')(module);

module.exports = function (err, socket, emit, res, noemit) { res = res || {}; noemit = noemit || false;
  if(err) {
    res.operation_status = constants.RS_BADSTATUS;
    res.operation_error = err.code || constants.errors.OTHER.code;
  
    // Логируем
    logger.error(emit);
    logger.error(err);
    // logger.error(err.stack);
  } else {
    res.operation_status = constants.RS_GOODSTATUS;
  }
  
  if(!noemit) {
    socket.emit(emit, res);
  }
};

