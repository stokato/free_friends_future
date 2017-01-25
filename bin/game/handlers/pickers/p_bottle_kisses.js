/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 *
 * @param game - Игра
 *
 * Обработчик события выбора игрока в рануде Бутылочка - этап второй - поцелуи
 * Отправляем всем выбор игрока
 * Запоминаем его
 * После того как все игроки походят или сработает таймер - переходим к завершению раунда
 *
 */
const validator = require('validator');

const Config      = require('./../../../../config.json');
const PF          = require('./../../../const_fields');
const oPool       = require('./../../../objects_pool');
const statCtrlr   = require('./../../../stat_controller');

const emitRes     = require('./../../../emit_result');

module.exports = function (game) {
  return function (socket, options) {
    if(!validator.isBoolean(options[PF.PICK] + "")) {
      return emitRes(Config.errors.NO_PARAMS, socket, Config.io.emits.IO_GAME_ERROR);
    }
  
    let uid = oPool.userList[socket.id].getID();
  
    game.addAction(uid, options);
  
    // Статистика по полученным поцелуям
    if(options[PF.PICK] == true) {
      let playersArr = game.getActivePlayers();
      let playersCount = playersArr.length;
      
      for(let i = 0; i < playersCount; i++) {
        if(playersArr[i].id != uid) {
          statCtrlr.setUserStat(playersArr[i].id, playersArr[i].vid, PF.BOTTLE_KISSED, 1);
        }
      }
    }
  
    // Отправляем всем выбор игрока
    let playerInfoObj = game.getActivePlayer(uid);
  
    let result = {
      [PF.ID]   : uid,
      [PF.VID]  : playerInfoObj.vid,
      [PF.PICK] : options[PF.PICK]
    };
  
    game.sendData(result);
  
    let stateObj = game.getGameState();
    
    if(!stateObj[PF.PICKS]) {
      stateObj[PF.PICKS] = [];
    }
  
    stateObj[PF.PICKS].push(result);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(game.CONST.G_BOTTLE_KISSES, game.CONST.GT_FIN)(game);
    }
  }
};