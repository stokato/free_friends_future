var async     =  require('async');
var constants = require('../../../constants');
var checkInput = require('./../common/check__game_input');
var oPool = require('./../../../objects_pool');
var handleError     = require('./../common/handle_error');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket) {
  socket.on(constants.IO_GAME, function(options) {
    
    var selfProfile = oPool.userList[socket.id];
    var uid = selfProfile.getID();
    var game = selfProfile.getGame();
    
    async.waterfall(
      [
        function (cb) {  cb(null, constants.IO_GAME, socket, game.getNextGame(), options); },
        checkInput,
        function (socket, options, cb) {
          // Если этому пользователю можно ходить, и он еще не превысил лимит ходов
          if(game._activePlayers[uid] && game._actionsLimits[uid] > 0) {
    
            // Вызваем обработчик текущей игры
            game._handlers[game._nextGame](false, socket, options);
          }
          cb(null, null);
        }
      ],
      function(err) {
        if(err) { return handleError(socket, constants.IO_GAME, game.getNextGame(), err); }
        
      });
    
  });
  
};