/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config        = require('./../../../../config.json');
const constants = require('./../../../constants');

const BOTTLE_TIMEOUT = Number(Config.game.timeouts.bottle);
const PF             = constants.PFIELDS;

module.exports = function (game) {
  
  game.clearActionsQueue();
  game.setActionsCount(1);
  game.setActionLimit(1);
  
  let pInfo = game.getActivePlayers()[0];
  
  let sex = (pInfo.sex == constants.GUY)? constants.GIRL : constants.GUY;
  
  let players = game.getRoom().getAllPlayers(sex);
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
  
  game.setStoredOptions(playersInfo);
  
  game.setNextGame(constants.G_BOTTLE);
  
  let result = {
    [PF.NEXTGAME] : constants.G_BOTTLE,
    [PF.PLAYERS] : []
  };
  
  result.players = game.getPlayersID();
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(constants.G_BOTTLE, constants.GT_FIN), BOTTLE_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(constants.G_BOTTLE, constants.GT_ON)(game));
};