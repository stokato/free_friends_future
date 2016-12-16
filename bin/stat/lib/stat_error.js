/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 */

var logger = require('./../../../lib/log')(module);

// Свой объект ошибок
function statError(func, message) {
  
  logger.error("STAT " + func + " : " + message);

}

module.exports = statError;