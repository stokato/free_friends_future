/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Обрабатываем результат
 */

const Config  = require('./../../../config.json');
const constants  = require('./../../constants');
const logger = require('./../../../lib/log')(module);

const GOOD_STATUS = Config.io.operation_statuses.good;
const BAD_STATUS  = Config.io.operation_statuses.bad;

module.exports = function (err, socket, emit, res) { res = res || {};
  if(err) {
    res.operation_status = BAD_STATUS;
    res.operation_error = err.code || constants.errors.OTHER.code;
  
    // Логируем
    logger.error(err.name + " : " + err.message);
    logger.error(err.stack);
  } else {
    res.operation_status = GOOD_STATUS;
  }
  
  socket.emit(emit, res);
};

