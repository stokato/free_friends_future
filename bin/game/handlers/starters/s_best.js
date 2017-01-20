/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Начало этапа Кто больше нравится
 * Получаем первого и второго кандидатов
 * Сохраняем их
 * Разрешаем остаьным делать выбор
 * Отпрвляем настройки игры
 * Устанавливаем таймаут на автозавершение сдедующего этапа
 * Устанавливаем обработчик события выбора игрока
 * Переходим к следующему этапу
 *
 */

const Config        = require('./../../../../config.json');
const PF            = require('./../../../const_fields');


module.exports = function (game) {
  
  const DEF_TIMEOUT   = Number(Config.game.timeouts.default);
  
  game.clearActionsQueue();
  
  // Получаем первого ирока
  let fpInfoObj = game.getActivePlayers()[0];
  
  // Получаем второго, того же пола
  let fSex = fpInfoObj.sex;
  let excludeIdsArr = [fpInfoObj.id];
  
  if(game.getPrisonerInfo()){
    excludeIdsArr.push(game.getPrisonerInfo().id);
  }
  
  let randPlayerProfile = game.getRoom().randomProfile(fSex, excludeIdsArr);
  
  // Если такого нет, останавливаем игру
  if(!randPlayerProfile) {
    return game.stop();
  }
  
  // Получаем сведения
  let spInfoObj = game.getPlayerInfo(randPlayerProfile);
  
  let bestPlayersArr = [fpInfoObj.id, spInfoObj.id];
  let best1Obj = {
    [PF.ID]  : fpInfoObj.id,
    [PF.VID] : fpInfoObj.vid,
    [PF.SEX] : fpInfoObj.sex
  };
  
  let best2Obj = {
    [PF.ID]  : spInfoObj.id,
    [PF.VID] : spInfoObj.vid,
    [PF.SEX] : spInfoObj.sex
  };
  
  
  let bpInfoArr = [best1Obj, best2Obj];
  
  // Сохраняем опции
  game.setStoredOptions({
    [fpInfoObj.id] : fpInfoObj,
    [spInfoObj.id] : spInfoObj
  });
  
  // Ходят все оставшиеся игроки по разу
  game.clearActivePlayers();
  game.activateAllPlayers(bestPlayersArr);
  
  game.setActionLimit(1);
  
  let countPrisoners = (game.getPrisonerInfo() === null)? 0 : 1;
  game.setActionsCount(game.getCountUsers() - countPrisoners - 2);
  game.setActionsMain(game.getActionsCount());
  
  game.setNextGame(game.CONST.G_BEST);
  
  let result = {
    [PF.NEXTGAME] : game.CONST.G_BEST,
    [PF.BEST]     : bpInfoArr,
    [PF.PLAYERS]  : game.getPlayersID()
  };
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_BEST, game.CONST.GT_FIN), DEF_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_BEST, game.CONST.GT_ON)(game));
};