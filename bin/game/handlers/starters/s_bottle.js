/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Начало раунда Бутылочка
 * Получаем игрока
 * Разрешаем ему выбор
 * Отпрвляем настройки игры
 * Устанавливаем таймаут на автозавершение сдедующего этапа
 * Устанавливаем обработчик события выбора игрока
 * Переходим к следующему этапу
 *
 */

const Config = require('./../../../../config.json');
const PF     = require('./../../../const_fields');

module.exports = function (game) {
  
  const BOTTLE_TIMEOUT = Number(Config.game.timeouts.bottle);
  const GUY            = Config.user.constants.sex.male;
  const GIRL            = Config.user.constants.sex.female;
  
  game.clearActionsQueue();
  game.setActionsCount(1);
  game.setActionLimit(1);
  
  let pInfoObj = game.getActivePlayers()[0];
  
  let sex = (pInfoObj.sex == GUY)? GIRL : GUY;
  
  let playersArr = game.getRoom().getAllPlayers(sex);
  let playersInfoArr = [];
  
  let prisonerID = null;
  let prisonerInfoObj = game.getPrisonerInfo();
  
  if(prisonerInfoObj) {
    prisonerID = prisonerInfoObj.id;
  }
  
  for(let i = 0 ; i < playersArr.length; i++) {
    if(prisonerID != playersArr[i].getID()) {
      playersInfoArr.push(game.getPlayerInfo(playersArr[i]));
    }
  }
  
  game.setStoredOptions(playersInfoArr);
  
  game.setNextGame(game.CONST.G_BOTTLE);
  
  let resultObj = {
    [PF.NEXTGAME] : game.CONST.G_BOTTLE,
    [PF.PLAYERS] : game.getPlayersID()
  };
  
  game.checkPrisoner(resultObj);
  
  game.sendData(resultObj);
  game.setGameState(resultObj);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_BOTTLE, game.CONST.GT_FIN), BOTTLE_TIMEOUT, game);
  
  game.setOnGame(game.getHandler(game.CONST.G_BOTTLE, game.CONST.GT_ON)(game));
};