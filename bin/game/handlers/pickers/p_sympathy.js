/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

const constants   = require('./../../../constants');
const oPool       = require('./../../../objects_pool');

const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');

const PF = constants.PFIELDS;

module.exports = function (game) {
  return function (socket, options) {
    if(!checkID(options[PF.PICK])) {
      return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_GAME_ERROR);
    }
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    // Нельзя выбрать себя
    if(uid == options[PF.PICK]) {
      return emitRes(constants.errors.SELF_ILLEGAL, socket, constants.IO_GAME_ERROR);
    }
    
    // Проверка - такого ирока нет
    if(!game.getActivePlayer(options[PF.PICK])) {
      return emitRes(constants.errors.SELF_ILLEGAL, socket, constants.IO_GAME_ERROR);
    }
  
    // Нельзя выбрать несколько раз одного и того же игрока
    let actions = game.getAction(uid);
    if(actions) {
      for( let i = 0; i < actions.length; i++) {
        if(actions[i][PF.PICK] == options[PF.PICK]) {
          return emitRes(constants.errors.FORBIDDEN_CHOICE, socket, constants.IO_GAME_ERROR);
        }
      }
    }
    
    // Нельзя выбрать игрока своего пола
    let playerInfo = game.getActivePlayer(options[PF.PICK]);
    if(playerInfo && selfProfile.getSex() == playerInfo.sex) {
      return emitRes(constants.errors.FORBIDDEN_CHOICE, socket, constants.IO_GAME_ERROR);
    }
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(constants.G_SYMPATHY, constants.GT_FIN)(game);
    }
  }
};