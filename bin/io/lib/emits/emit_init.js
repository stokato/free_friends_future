var async     =  require('async');

// Свои модули
var constants         = require('../../../constants'),
    PF                = constants.PFIELDS,
    oPool             = require('../../../objects_pool'),
    init              = require('../profile/init_profile'),
    handleError       = require('../common/handle_error'),
    checkInput        = require('../common/check_input'),
    getLastMessages   = require('../common/get_last_messages'),
    emitAllRooms      = require('../common/emit_all_rooms'),
    sendPrivateChats  = require('../chat/send_private_chats');


module.exports = function (socket) {
  socket.on(constants.IO_INIT, function(options) {
    
    async.waterfall(
      [
        function (cb) {  cb(null, constants.IO_INIT, socket, options); },
        checkInput,
        init,
        function (info, cb) {
  
          info.operation_status = constants.errors.RS_GOODSTATUS;
          socket.emit(constants.IO_INIT, info);
          
          var params = {};
          params[PF.ID]   = info[PF.ID];
          params[PF.VID]  = info[PF.VID];
          
          emitAllRooms(socket, constants.IO_ONLINE, params);
  
          getLastMessages(socket, oPool.rooms[info[PF.ROOM][PF.ROOMNAME]]);
          
          sendPrivateChats(socket, cb);
        }
      ],
      function(err) {
        if(err) { handleError(socket, constants.IO_INIT, err); }
      });
    
  })
};




