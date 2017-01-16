/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

const oPool       = require('./../../../objects_pool');
const constants   = require('./../../../constants');

const checkID     = require('./../../../check_id');
const emitRes     = require('./../../../emit_result');

const PF          = constants.PFIELDS;

module.exports = function (game) {
  return function (socket, options) {
    if(!checkID(options[PF.PICK])) {
      return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_GAME_ERROR);
    }
    
    // Ошибка - если выбранного пользоателя нет среди кандидатов
    let bests = game.getStoredOptions();
    if (!bests[options[PF.PICK]]) {
      return emitRes(constants.errors.NO_THAT_PLAYER, socket, constants.IO_GAME_ERROR);
    }
    
    // Сохраняем ход игрока
    let uid = oPool.userList[socket.id].getID();
  
    game.addAction(uid, options);
    
    // // Статистика
    // for (let item in bests) if (bests.hasOwnProperty(item)) {
    //   let pInfo = bests[item];
    //   if (options[PF.PICK] == pInfo.id) {
    //     if (!pInfo.picks) {
    //       pInfo.picks = 1;
    //     } else {
    //       pInfo.picks++;
    //     }
    //   }
    // }
    
    // Оповещаем о ходе всех в комнате
    let playerInfo = game.getActivePlayer(uid);
    
    game.sendData({
      [PF.PICK]: {
        [PF.ID]: uid,
        [PF.VID]: playerInfo.vid,
        [PF.PICK]: options[PF.PICK]
      }
    });
    
    // Сохраняем состояние игры
    let state = game.getGameState();
    if (!state[PF.PICKS]) {
      state[PF.PICKS] = [];
    }
    state[PF.PICKS].push(options[PF.PICK]);
    
    if (game.getActionsCount() == 0) {
      game.getHandler(constants.G_BEST, constants.GT_FIN)(game);
    }
  }
};