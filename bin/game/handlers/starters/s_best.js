/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config        = require('./../../../../config.json');
const constants   = require('./../../../constants');

const PF          = constants.PFIELDS;
const DEF_TIMEOUT    = Number(Config.game.timeouts.default);

module.exports = function (game) {
  
  game.clearActionsQueue();
  
  // Получаем первого ирока
  let fpInfo = game.getActivePlayers()[0];
  
  // Получаем второго, того же пола
  let fSex = fpInfo.sex;
  let excludeIds = [fpInfo.id];
  
  if(game.getPrisonerInfo()){
    excludeIds.push(game.getPrisonerInfo().id);
  }
  
  let randPlayer = game._room.randomProfile(fSex, excludeIds);
  
  if(!randPlayer) {
    return game.stop();
  }
  
  // Получаем сведения
  let spInfo = game.getPlayerInfo(randPlayer);
  
  let bestPlayers = [fpInfo.id, spInfo.id];
  let best1 = {
    [PF.ID]  : fpInfo.id,
    [PF.VID] : fpInfo.vid,
    [PF.SEX] : fpInfo.sex
  };
  
  let best2 = {
    [PF.ID]  : spInfo.id,
    [PF.VID] : spInfo.vid,
    [PF.SEX] : spInfo.sex
  };
  
  
  let bpInfo = [best1, best2];
  
  // Сохраняем опции
  game.setStoredOptions({
    [fpInfo.id] : fpInfo,
    [spInfo.id] : spInfo
  });
  
  // Ходят все оставшиеся игроки по разу
  game.clearActivePlayers();
  game.activateAllPlayers(bestPlayers);
  
  game.setActionLimit(1);
  
  let countPrisoners = (game.getPrisonerInfo() === null)? 0 : 1;
  game.setActionsCount(game.getCountUsers() - countPrisoners - 2);
  game.setActionsMain(game.getActionsCount());
  
  game.setNextGame(constants.G_BEST);
  
  let result = {
    [PF.NEXTGAME] : constants.G_BEST,
    [PF.PLAYERS] : []
  };
  
  result.best = bpInfo;
  
  result.players = game.getPlayersID();
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(constants.G_BEST, constants.GT_FIN), DEF_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(constants.G_BEST, constants.GT_ON)(game));
};