/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config    = require('./../../../../config.json');
const constants = require('./../../../constants');

const  PF              = constants.PFIELDS;
const LOT_TIMEOUT = Config.game.timeouts.lot;

module.exports = function(game) {
  
  // Получаем следующего игрока
  let nextPlayerInfo;
  
  // Проверка - чтобы не убирать из тюрьмы сразу после попадания в нее
  if(game.getNextGame() != game.CONST.G_PRISON) {
    if(game.getPrisonerInfo()) {
      
      // Если игрок, попавший за решетку, вышел из комнаты, очищаем тюрьму
      if(!game.getRoom().isProfile(game.getPrisonerInfo().id)) {
        game.clearPrison();
      }
    }
    nextPlayerInfo = game.selectNextPlayer(true);
  } else {
    nextPlayerInfo = game.selectNextPlayer(false);
  }
  
  // Очищаем настройки
  game.clearActivePlayers();
  game.clearActionsQueue();
  
  // Игрок 1 и ходит 1 раз
  game.setActivePlayer(nextPlayerInfo.id, nextPlayerInfo);
  game.setActionLimit(1);
  game.setActionsCount(1);
  
  // Следующий этап - волчек
  game.setNextGame(game.CONST.G_LOT);
  
  // Отправляем результат
  let result = {
    [PF.NEXTGAME] : game.CONST.G_LOT,
    [PF.PLAYERS]  : game.getPlayersID(),
    [PF.PRISON]   : null
  };
  
  game.checkPrisoner(result);
  
  game.sendData(result);
  game.setGameState(result);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_LOT, game.CONST.GT_FIN), LOT_TIMEOUT, game);
  
  // Обработчик выбора игрока
  game.setOnGame(game.getHandler(game.CONST.G_LOT, game.CONST.GT_ON)(game));
};
