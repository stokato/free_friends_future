/**
 * Created by s.t.o.k.a.t.o on 30.12.2016.
 */

const Config  = require('./../../../config.json');
const ioc     = require('./../../io_controller');

module.exports = function (socket) {
  
  const EMITS = Config.io.emits;
  
  ioc.removeEmit(socket, EMITS.IO_GET_ACTIVE_RANK);
  ioc.removeEmit(socket, EMITS.IO_GET_RANKS);
  ioc.removeEmit(socket, EMITS.IO_CHANGE_ACTIVE_RANK);
  
};
