/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 */

const logger = require('./../../../lib/log')(module);

// Свой объект ошибок
function statError(func, err) {
  
  logger.error("STAT " + func);
  logger.error(err);

}

module.exports = statError;