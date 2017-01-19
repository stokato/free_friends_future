/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

const Config      = require('./../../../../config.json');
const oPool       = require('./../../../objects_pool');

const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');

const PF = require('./../../../const_fields');
const IO_GAME_ERROR = Config.io.emits.IO_GAME_ERROR;

module.exports = function (game) {
  return function (socket, options) {
    if(!checkID(options[PF.PICK])) {
      return emitRes(Config.errors.NO_PARAMS, socket, IO_GAME_ERROR);
    }
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    // Нельзя выбрать себя
    if(uid == options[PF.PICK]) {
      return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_GAME_ERROR);
    }
    
    // Проверка - такого ирока нет
    if(!game.getActivePlayer(options[PF.PICK])) {
      return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_GAME_ERROR);
    }
  
    // Нельзя выбрать несколько раз одного и того же игрока
    let actions = game.getAction(uid);
    if(actions) {
      for( let i = 0; i < actions.length; i++) {
        if(actions[i][PF.PICK] == options[PF.PICK]) {
          return emitRes(Config.errors.FORBIDDEN_CHOICE, socket, IO_GAME_ERROR);
        }
      }
    }
    
    // Нельзя выбрать игрока своего пола
    let playerInfo = game.getActivePlayer(options[PF.PICK]);
    if(playerInfo && selfProfile.getSex() == playerInfo.sex) {
      return emitRes(Config.errors.FORBIDDEN_CHOICE, socket, IO_GAME_ERROR);
    }
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(game.CONST.G_SYMPATHY, game.CONST.GT_FIN)(game);
    }
  }
};