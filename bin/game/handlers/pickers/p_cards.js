/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */
const validator = require('validator');

const Config = require('./../../../../config.json');
const constants    = require('./../../../constants');
const oPool       = require('./../../../objects_pool');

const emitRes   = require('./../../../emit_result');

const CARD_COUNT = Number(Config.game.card_count);
const PF = constants.PFIELDS;

module.exports = function (game) {
  return function (socket, options) {
    if(!validator.isInt(options[PF.PICK] + "") ||
        options[PF.PICK] > CARD_COUNT-1 ||
        options[PF.PICK] < 0) {
      return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_GAME_ERROR);
    }
  
    let selfProfile = oPool.userList[socket.id];
    let uid         = selfProfile.getID();
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(constants.G_CARDS, constants.GT_FIN)(game);
    }
  }
};