/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config        = require('./../../../../../config.json');
const constants    = require('./../../../../constants');
const oPool       = require('../../../../objects_pool');

const addAction       = require('../../common/add_action');
const finishCards     = require('../finishers/f_cards');

const DEF_TIMEOUT    = Number(Config.game.timeouts.default);
const PF             = constants.PFIELDS;

module.exports = function (game) {
  
  game._actionsQueue = {};
  
  game._activePlayers = {};
  game.activateAllPlayers();
  
  game.setActionLimit(1);
  
  let countPrisoners = (game._prisoner === null)? 0 : 1;
  
  game._actionsCount = game._currCountInRoom - countPrisoners;
  game._actionsMain = game._actionsCount;
  
  game._nextGame = constants.G_CARDS;
  
  let result = {
    [PF.NEXTGAME] : constants.G_CARDS,
    [PF.PLAYERS] : []
  };
  
  result.players = game.getPlayersID();
  
  game.checkPrisoner(result);
  
  game.emit(result);
  game._gameState = result;
  
  // Устанавливаем таймаут
  game.startTimer(game._handlers.finishers.finishCards, DEF_TIMEOUT, game);
  
  game._onGame = function (socket, options) {
    let selfProfile = oPool.userList[socket.id];
    let uid         = selfProfile.getID();
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
  
    if(game._actionsCount == 0) {
      game._handlers.finishers.finishCards(false, game);
    }
  }
};