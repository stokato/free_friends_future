/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

const validator = require('validator');

const Config      = require('./../../../../config.json');
const oPool       = require('./../../../objects_pool');

const emitRes         = require('./../../../emit_result');

const PF = require('./../../../const_fields');
const QUESTIONS_COUNT = Number(Config.game.questions_count);

module.exports = function (game) {
  return function (socket, options) {
    if(!validator.isInt(options[PF.PICK] + "") ||
        options[PF.PICK] > QUESTIONS_COUNT ||
        options[PF.PICK] < 1) {
      return emitRes(Config.errors.NO_PARAMS, socket, Config.io.emits.IO_GAME_ERROR);
    }
    
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(game.CONST.G_QUESTIONS, game.CONST.GT_FIN)(game);
    }
  }
};