var GameError = require('../../game_error'),
    checkInput = require('../../check_input');

module.exports = function(socket, userList, profiles) {
  socket.on('close_private_chat', function(options) {
      if (!checkInput('close_private_chat', socket, userList, options))
          return new GameError(socket, "CLOSEPRIVCHAT", "Верификация не пройдена");

      var selfProfile = userList[socket.id];
      if(!selfProfile.isPrivateChat(options.id)) {
          return new GameError(socket, "CLOSEPRIVCHAT", "Приватного чата с этим пользователем не существует");
      }

      selfProfile.deletePrivateChat(options.id);

      var compProfile = profiles[options.id];
      compProfile.deletePrivateChat(selfProfile.getID());

      socket.emit('close_private_chat', { id : options.id });

      var compSocket = compProfile.getSocket();
      compSocket.emit('close_private_chat', { id : selfProfile.getID() });
  });
};