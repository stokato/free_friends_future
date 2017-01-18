/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config        = require('./../../../../config.json');
const constants = require('./../../../constants');

const BOTTLE_TIMEOUT = Number(Config.game.timeouts.bottle);
const PF             = constants.PFIELDS;

const GUY = Config.user.constants.sex.male;
const GIRL = Config.user.constants.sex.female;

module.exports = function (game) {
  
  game.clearActionsQueue();
  game.setActionsCount(1);
  game.setActionLimit(1);
  
  let pInfo = game.getActivePlayers()[0];
  
  let sex = (pInfo.sex == GUY)? GIRL : GUY;
  
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
  
  game.setNextGame(game.CONST.G_BOTTLE);
  
  let result = {
    [PF.NEXTGAME] : game.CONST.G_BOTTLE,
    [PF.PLAYERS] : game.getPlayersID()
  };
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_BOTTLE, game.CONST.GT_FIN), BOTTLE_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_BOTTLE, game.CONST.GT_ON)(game));
};