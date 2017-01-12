/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config = require('./../../../../../config.json');
const constants = require('./../../../../constants');
const oPool  = require('../../../../objects_pool');

const addAction     = require('../../common/add_action');
const finishPrison  = require('../finishers/f_prison');

const PRISON_TIMEOUT = Config.game.timeouts.prison;
const PF             = constants.PFIELDS;
  
module.exports = function (game) {
  
  game._nextGame = constants.G_PRISON;
  
  game._actionsQueue = {};
  
  let result = {
    [PF.NEXTGAME] : constants.G_PRISON,
    [PF.PLAYERS] : []
  };
  
  result.players = game.getPlayersID();
  
  game.checkPrisoner(result);
  
  game.emit(result);
  game._gameState = result;
  
  game.startTimer(game._handlers.finishers.finishPrison, PRISON_TIMEOUT, game);
  
  game._onGame = function (socket, options) {
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
  
    if(game._actionsCount == 0) {
      game._handlers.finishers.finishPrison(false, game);
    }
  }
};