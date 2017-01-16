/**
 * Обрабатываем действие игрока:
 *  - проверяем его ввод
 *  - проверяем - разрешено ли ему ходить
 *  - вызываем обработчик текущей игры
 *
 *  @param socket
 */

const validator = require('validator');

const constants = require('../../constants');
const oPool     = require('./../../objects_pool');

const sanitize  = require('./../../sanitize');
const emitRes   = require('./../../emit_result');

const PF        = constants.PFIELDS;

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, options) {
    if(!PF.PICK in options) {
      return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_GAME_ERROR);
    }
  
    if(!validator.isBoolean(options[PF.PICK] + "")) {
      options[PF.PICK] = sanitize(options[PF.PICK]);
    }
        
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
    let game = selfProfile.getGame();
  
    if(game.getActivePlayer(uid) && game.getActionsLimits(uid) > 0) {
    
      // Вызваем обработчик текущей игры
      game.sendRoomInfo(socket, options);
    }
};