/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const constants = require('./../../../constants');

module.exports = function(game) {
  
  game.clearTimer();
  
  // Если игроков недостаточно - останавливаем игру
  if(!game.checkCountPlayers()) {
    return game.stop();
  }
  
  game.setCountUsers(game.getRoom().getCountInRoom());

  // Определяем следующую игру, если игроков слишком мало - то без тюрьмы
  let rand, games;
  
  if(game.getPrisonerInfo() !== null ||
      game.getRoom().getCountInRoom(constants.GIRL) <= 2 ||
      game.getRoom().getCountInRoom(constants.GUY) <= 2) {
    
    games = constants.GAMES_WITHOUT_PRISON;
  } else {
    games = constants.GAMES;
  }
  
  do {
    rand = Math.floor(Math.random() * games.length);
  } while(rand == game.getStoredRand());
  
  game.setStoredRand(rand);
  
  game.getHandler(games[rand], constants.GT_ST)(game);
};
