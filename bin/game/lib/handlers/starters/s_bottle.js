/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config        = require('./../../../../../config.json');
const constants = require('./../../../../constants');
const oPool = require('./../../../../objects_pool');

const addAction     = require('./../../common/add_action');
const finishBottle  = require('./../finishers/f_bottle');

const BOTTLE_TIMEOUT = Number(Config.game.timeouts.bottle);
const PF             = constants.PFIELDS;

module.exports = function (game) {
  
  game._actionsQueue = {};
  game._actionsCount = 1;
  game.setActionLimit(1);
  
  let player = null;
  for(let item in game._activePlayers) if (game._activePlayers.hasOwnProperty(item)) {
    player = game._activePlayers[item];
  }
  
  let sex = (player.sex == constants.GUY)? constants.GIRL : constants.GUY;
  
  let players = game._room.getAllPlayers(sex);
  let playersInfo = [];
  
  let prisonerID = null;
  if(game.getPrisonerInfo()) {
    prisonerID = game.getPrisonerInfo().id;
  }
  
  for(let i = 0 ; i < players.length; i++) {
    if(prisonerID != players[i].getID()) {
      playersInfo.push(game.getPlayerInfo(players[i]));
    }
  }
  
  game._storedOptions = playersInfo;
  
  game._nextGame = constants.G_BOTTLE;
  
  let result = {
    [PF.NEXTGAME] : constants.G_BOTTLE,
    [PF.PLAYERS] : []
  };
  
  result.players = game.getPlayersID();
  
  game.checkPrisoner(result);
  
  game.emit(result);
  game._gameState = result;
  
  // Устанавливаем таймаут
  game.startTimer(game._handlers.finishers.finishBottle, BOTTLE_TIMEOUT, game);
  
  game._onGame = function (socket, options) {
    let uid = oPool.userList[socket.id].getID();
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
  
    clearTimeout(game._timer);
  
    if(game._actionsCount == 0) {
      game._handlers.finishers.finishBottle(false, game);
    }
  }
};