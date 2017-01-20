/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 *
 * @param game - Игра
 *
 * Завершаем раунд Волчек
 * Определяем - какой раунд следующий
 * Переходим к следующему раунду
 *
 */

const Config    = require('./../../../../config.json');

module.exports = function(game) {
  
  const GUY = Config.user.constants.sex.male;
  const GIRL = Config.user.constants.sex.female;
  
  game.clearTimer();
  
  // Если игроков недостаточно - останавливаем игру
  if(!game.checkCountPlayers()) {
    return game.stop();
  }
  
  game.setCountUsers(game.getRoom().getCountInRoom());

  // Определяем следующую игр
  let rand, gamesArr;
  
  let playerInfo = game.getActivePlayers()[0];
  
  if(game.getPrisonerInfo() !== null ||                   // Тюрьмя занята
      game.getPrisonProtection(playerInfo.id) ||          // Текущий игрок защищен от тюрьмы
      game.getRoom().getCountInRoom(GIRL) <= 2 ||         // Игроков слишком мало
      game.getRoom().getCountInRoom(GUY) <= 2) {
    
    gamesArr = game.CONST.GAMES_WITHOUT_PRISON;
  } else {
    gamesArr = game.CONST.GAMES;
  }
  
  do {
    rand = Math.floor(Math.random() * gamesArr.length);
  } while(rand == game.getStoredRand());
  
  game.removeProtection();
  
  game.setStoredRand(rand);
  
  game.getHandler(gamesArr[rand], game.CONST.GT_ST)(game);
};
