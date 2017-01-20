/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 *
 * @param game - Игра
 *
 * Обработчик события выбора игрока в рануде Симпатии - этап первый - выбор игроков
 * Запоминаем выбор игрока
 * После того как все игроки походят или сработает таймер - переходим к завершению раунда
 */

const Config      = require('./../../../../config.json');
const PF          = require('./../../../const_fields');
const oPool       = require('./../../../objects_pool');

const checkID     = require('./../../../check_id');
const emitRes     = require('./../../../emit_result');

module.exports = function (game) {
  
  const IO_GAME_ERROR = Config.io.emits.IO_GAME_ERROR;
  
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
    let actionsArr = game.getActions(uid);
    if(actionsArr) {
      let actionsCount = actionsArr.length;
      
      for( let i = 0; i < actionsCount; i++) {
        if(actionsArr[i][PF.PICK] == options[PF.PICK]) {
          return emitRes(Config.errors.FORBIDDEN_CHOICE, socket, IO_GAME_ERROR);
        }
      }
    }
    
    // Нельзя выбрать игрока своего пола
    let playerInfoObj = game.getActivePlayer(options[PF.PICK]);
    if(playerInfoObj && selfProfile.getSex() == playerInfoObj.sex) {
      return emitRes(Config.errors.FORBIDDEN_CHOICE, socket, IO_GAME_ERROR);
    }
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(game.CONST.G_SYMPATHY, game.CONST.GT_FIN)(game);
    }
  }
};