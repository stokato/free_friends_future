var GameError = require('../../game_error'),
  checkInput = require('../../check_input'),
  //sanitize        = require('../../sanitizer'),
  constants = require('./../../constants');

var oPool = require('./../../objects_pool');

module.exports = function(socket) {
  socket.on(constants.IO_CLOSE_PRIVATE_CHAT, function(options) {
    if (!checkInput(constants.IO_CLOSE_PRIVATE_CHAT, socket, oPool.userList, options)) { return; }

    var selfProfile = oPool.userList[socket.id];

    //options.id = sanitize(options.id);

    if(!selfProfile.isPrivateChat(options.id)) {
      return handError(constants.errors.NO_SUCH_CHAT);
    }

    selfProfile.deletePrivateChat(options.id);


    socket.emit(constants.IO_CLOSE_PRIVATE_CHAT, {
      id : options.id,
      operation_status : constants.RS_GOODSTATUS
    });

    //if (profiles[options.id]) { // Если онлайн
    //  var compProfile = profiles[options.id];
    //  compProfile.deletePrivateChat(selfProfile.getID());
    //
    //  var compSocket = compProfile.getSocket();
    //  compSocket.emit('close_private_chat', { id : selfProfile.getID() });
    //}

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_CLOSE_PRIVATE_CHAT, res);

      new GameError(socket, constants.IO_CLOSE_PRIVATE_CHAT, err.message || constants.errors.OTHER.message);
    }
  });
};
