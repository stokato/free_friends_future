/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 *
 * @param game - Игра
 *
 * Обработчик события выбора игрока в рануде Кто больше нравится
 * После того как все игроки походят или сработает таймер - переходим к завершению раунда
 *
 */

const Config      = require('./../../../../config.json');
const oPool       = require('./../../../objects_pool');

const checkID     = require('./../../../check_id');
const emitRes     = require('./../../../emit_result');

const PF          = require('./../../../const_fields');

module.exports = function (game) {
  return function (socket, options) {
    if(!checkID(options[PF.PICK])) {
      return emitRes(Config.errors.NO_PARAMS, socket, Config.io.emits.IO_GAME_ERROR);
    }
    
    // Ошибка - если выбранного пользоателя нет среди кандидатов
    let bestsObj = game.getStoredOptions();
    if (!bestsObj[options[PF.PICK]]) {
      return emitRes(Config.errors.NO_THAT_PLAYER, socket, Config.io.emits.IO_GAME_ERROR);
    }
    
    // Сохраняем ход игрока
    let uid = oPool.userList[socket.id].getID();
  
    game.addAction(uid, options);
    
    // Оповещаем о ходе всех в комнате
    let playerInfoObj = game.getActivePlayer(uid);
    
    game.sendData({
      [PF.PICK]: {
        [PF.ID]: uid,
        [PF.VID]: playerInfoObj.vid,
        [PF.PICK]: options[PF.PICK]
      }
    });
    
    // Сохраняем состояние игры
    let stateObj = game.getGameState();
    if (!stateObj[PF.PICKS]) {
      stateObj[PF.PICKS] = [];
    }
    stateObj[PF.PICKS].push(options[PF.PICK]);
    
    if (game.getActionsCount() == 0) {
      game.clearTimer();
      game.getHandler(game.CONST.G_BEST, game.CONST.GT_FIN)(game);
    }
  }
};