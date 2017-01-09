/**
 * Обрабатываем действие игрока:
 *  - проверяем его ввод
 *  - проверяем - разрешено ли ему ходить
 *  - вызываем обработчик текущей игры
 *
 *  @param socket
 */
const async  =  require('async');

const constants       = require('../../../constants'),
    checkInput      = require('./../common/check__game_input'),
    oPool           = require('./../../../objects_pool'),
    handleError     = require('./../common/handle_error');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket) {
  socket.on(constants.IO_GAME, function(options) {
    
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
    let game = selfProfile.getGame();
  
    async.waterfall([ //---------------------------------------------------------
      function (cb) {  cb(null, constants.IO_GAME, socket, game.getNextGame(), options); },
      checkInput,
      function (socket, options, cb) {
        // Если этому пользователю можно ходить, и он еще не превысил лимит ходов
        if(game._activePlayers[uid] && game._actionsLimits[uid] > 0) {
        
          // Вызваем обработчик текущей игры
          game._handlers[game._nextGame](false, socket, options);
        }
        cb(null, null);
      }], //-------------------------------------------------------------------
      function(err) {
        if(err) { return handleError(socket, constants.IO_GAME, game.getNextGame(), err); }
      
      });
  });
  
};