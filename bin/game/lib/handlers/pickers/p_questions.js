/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config        = require('./../../../../../config.json');
const constants   = require('../../../../constants');
const oPool       = require('../../../../objects_pool');

const addAction       = require('../../common/add_action');
const finishQuestions = require('../finishers/f_questions');
const checkPrisoner = require('./../../common/check_prisoner');

const PF = constants.PFIELDS;
const DEF_TIMEOUT    = Number(Config.game.timeouts.default);

module.exports = function (game, result) {
  
  game._activePlayers = {};
  game.activateAllPlayers();
  
  game.setActionLimit(1);
  
  let countPrisoners = (game._prisoner === null)? 0 : 1;
  
  game._actionsCount = game._currCountInRoom - countPrisoners;
  game._actionsMain = game._actionsCount;
  
  result[PF.QUESTION] =  game.getRandomQuestion();
  
  result.players = game.getPlayersID();
  
  checkPrisoner(game, result);
  
  game.emit(result);
  game._gameState = result;
  
  // Устанавливаем таймаут
  game.startTimer(game._handlers[game._nextGame], DEF_TIMEOUT);
  
  return function (socket, options) {
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
  
    if(game._actionsCount == 0) {
      finishQuestions(false, socket, game);
    }
  }
};