/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config = require('./../../../../../config.json');
const oPool  = require('../../../../objects_pool');

const addAction     = require('../../common/add_action');
const checkPrisoner = require('./../../common/check_prisoner');
const finishPrison  = require('../finishers/f_prison');

const PRISON_TIMEOUT = Config.game.timeouts.prison;
  
module.exports = function (game, result) {
  
  result.players = game.getPlayersID();
  
  checkPrisoner(game, result);
  
  game.emit(result);
  game._gameState = result;
  
  game.startTimer(game._handlers[game._nextGame], PRISON_TIMEOUT);
  
  return function (socket, options) {
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
  
    if(game._actionsCount == 0) {
      finishPrison(false, socket, game);
    }
  }
};