/**
 * Created by s.t.o.k.a.t.o on 30.12.2016.
 */

const constants = require('./../../constants');
const ioc = require('./../../io_controller');

module.exports = function (socket) {
  
  ioc.removeEmit(socket, constants.IO_GET_ACTIVE_RANK);
  ioc.removeEmit(socket, constants.IO_GET_RANKS);
  ioc.removeEmit(socket, constants.IO_CHANGE_ACTIVE_RANK);
  
};
