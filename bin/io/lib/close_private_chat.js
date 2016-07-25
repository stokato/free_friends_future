var GameError = require('../../game_error'),
  checkInput = require('../../check_input'),
  sanitize        = require('../../sanitizer'),
  constants = require('./../constants');

module.exports = function(socket, userList, profiles) {
  socket.on(constants.IO_CLOSE_PRIVATE_CHAT, function(options) {
    if (!checkInput(constants.IO_CLOSE_PRIVATE_CHAT, socket, userList, options)) { return; }

    var selfProfile = userList[socket.id];
    var f = constants.FIELDS;

    options[f.id] = sanitize(options[f.id]);

    if(!selfProfile.isPrivateChat(options[f.id])) {
      return new GameError(socket, constants.IO_CLOSE_PRIVATE_CHAT,
                                   "Приватного чата с этим пользователем не существует");
    }

    selfProfile.deletePrivateChat(options[f.id]);

    var result = {};
    result[f.id] = options[f.id];
    socket.emit(constants.IO_CLOSE_PRIVATE_CHAT, result);

    //if (profiles[options.id]) { // Если онлайн
    //  var compProfile = profiles[options.id];
    //  compProfile.deletePrivateChat(selfProfile.getID());
    //
    //  var compSocket = compProfile.getSocket();
    //  compSocket.emit('close_private_chat', { id : selfProfile.getID() });
    //}
  });
};
