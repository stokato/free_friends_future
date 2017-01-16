/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

const validator = require('validator');

const constants   = require('./../../../constants');
const oPool       = require('./../../../objects_pool');

const emitRes         = require('./../../../emit_result');

const PF = constants.PFIELDS;

module.exports = function (game) {
  return function (socket, options) {
    if(!validator.isInt(options[PF.PICK] + "") ||
        options[PF.PICK] > constants.QUESTIONS_COUNT ||
        options[PF.PICK] < 1) {
      return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_GAME_ERROR);
    }
    
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(constants.G_QUESTIONS, constants.GT_FIN)(game);
    }
  }
};