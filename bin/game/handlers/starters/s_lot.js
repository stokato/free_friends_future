/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Начало раунда Волчек
 * Получаем следующего игрока - он не должен сидеть в тюрьме
 * Разрешаем игроку ходить
 * Отправляем настрйки
 * Устанавливаем таймаут на автозавершение сдедующего этапа
 * Устанавливаем обработчик события выбора игрока
 * Переходим к следующему этапу
 */

const Config  = require('./../../../../config.json');
const  PF     = require('./../../../const_fields');


module.exports = function(game) {
  
  const LOT_TIMEOUT = Config.game.timeouts.lot;
  
  // Получаем следующего игрока
  let nextPlayerInfoObj;
  
  // Проверка - чтобы не убирать из тюрьмы сразу после попадания в нее
  if(game.getNextGame() != game.CONST.G_PRISON) {
    if(game.getPrisonerInfo()) {
      
      // Если игрок, попавший за решетку, вышел из комнаты, очищаем тюрьму
      if(!game.getRoom().isProfile(game.getPrisonerInfo().id)) {
        game.clearPrison();
      }
    }
    nextPlayerInfoObj = game.selectNextPlayer(true);
  } else {
    nextPlayerInfoObj = game.selectNextPlayer(false);
  }
  
  // Очищаем настройки
  game.clearActivePlayers();
  game.clearActionsQueue();
  
  // Игрок 1 и ходит 1 раз
  game.setActivePlayer(nextPlayerInfoObj.id, nextPlayerInfoObj);
  game.setActionLimit(1);
  game.setActionsCount(1);
  
  // Следующий этап - волчек
  game.setNextGame(game.CONST.G_LOT);
  
  // Отправляем результат
  let resultObj = {
    [PF.NEXTGAME] : game.CONST.G_LOT,
    [PF.PLAYERS]  : game.getPlayersID(),
    [PF.PRISON]   : null
  };
  
  game.checkPrisoner(resultObj);
  
  game.sendData(resultObj);
  game.setGameState(resultObj);
  
  // Устанавливаем таймаут
  game.startTimer(game.getHandler(game.CONST.G_LOT, game.CONST.GT_FIN), LOT_TIMEOUT, game);
  
  // Обработчик выбора игрока
  game.setOnGame(game.getHandler(game.CONST.G_LOT, game.CONST.GT_ON)(game));
};
