/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */
const validator = require('validator');

const Config      = require('./../../../../config.json');
const PF   = require('./../../../const_fields');
const oPool       = require('./../../../objects_pool');
const stat        = require('./../../../stat_manager');

const emitRes     = require('./../../../emit_result');

module.exports = function (game) {
  return function (socket, options) {
    if(!validator.isBoolean(options[PF.PICK] + "")) {
      return emitRes(Config.errors.NO_PARAMS, socket, Config.io.emits.IO_GAME_ERROR);
    }
  
    let uid = oPool.userList[socket.id].getID();
  
    game.addAction(uid, options);
  
    // Статистика
    if(options[PF.PICK] == true) {
      let players = game.getActivePlayers();
      for(let i = 0; i < players.length; i++) {
        if(players[i].id != uid) {
          stat.setUserStat(players[i].id, players[i].vid, PF.BOTTLE_KISSED, 1);
        }
      }
    }
  
    // Отправляем всем выбор игрока
    let playerInfo = game.getActivePlayer(uid);
  
    let result = {
      [PF.ID]   : uid,
      [PF.VID]  : playerInfo.vid,
      [PF.PICK] : options[PF.PICK]
    };
  
    game.sendData(result);
  
    let state = game.getGameState();
    
    if(!state[PF.PICKS]) {
      state[PF.PICKS] = [];
    }
  
    state[PF.PICKS].push(result);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(game.CONST.G_BOTTLE_KISSES, game.CONST.GT_FIN)(game);
    }
  }
};