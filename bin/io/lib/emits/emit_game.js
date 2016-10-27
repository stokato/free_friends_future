var async     =  require('async');
var oPool = require('./../../../objects_pool');

// Свои модули
var constants     = require('../../../constants'),
  add_action      = require('../../../game/lib/add_action'),
  handleError     = require('../../../handle_error'),
  checkInput      = require('../../../check_input');


// Добавляем трек в очередь плей-листа комнаты
module.exports = function(socket) {
  socket.on(constants.IO_GAME, function(options) {
  
    var selfProfile = oPool.userList[socket.id];
    var game = selfProfile.getGame();
    
    options.gNextGame = game.getNextGame();
    
    async.waterfall(
      [
        function (cb) {  cb(null, constants.IO_GAME, socket, options); },
        checkInput,
        add_action,
      ],
      function(err) {
        if(err) { handleError(socket, constants.IO_GAME, err); }

        // В игре не отправляюстя результаты запроса
      });
    
  });
};