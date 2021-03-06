/**
 *  @param socket
 *  @param options
 *
 * Обрабатываем действие игрока:
 *  - проверяем его ввод
 *  - проверяем - разрешено ли ему ходить
 *  - вызываем обработчик текущей игры
 */

const validator = require('validator');

const Config    = require('./../../../config.json');
const PF        = require('../../const_fields');
const oPool     = require('./../../objects_pool');

const sanitize  = require('./../../sanitize');
const emitRes   = require('./../../emit_result');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, options) {
    if(!PF.PICK in options) {
      return emitRes(Config.errors.NO_PARAMS, socket, Config.io.emits.IO_GAME_ERROR);
    }
  
    if(!validator.isBoolean(options[PF.PICK] + "")) {
      options[PF.PICK] = sanitize(options[PF.PICK]);
    }
        
    let selfProfile = oPool.userList[socket.id];
  
    selfProfile.setActivity();
  
    let uid = selfProfile.getID();
    let game = selfProfile.getGame();
  
    if(game.getActivePlayer(uid) && game.getActionsLimits(uid) > 0) {
    
      // Вызваем обработчик текущей игры
      game.sendRoomInfo(socket, options);
    }
};