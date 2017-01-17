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
  
  let playerInfo = game.getActivePlayers()[0];
  
  if(game.getPrisonerInfo() !== null ||
      game.getPrisonProtection(playerInfo.id) ||
      game.getRoom().getCountInRoom(constants.GIRL) <= 2 ||
      game.getRoom().getCountInRoom(constants.GUY) <= 2) {
    
    games = game.CONST.GAMES_WITHOUT_PRISON;
  } else {
    games = game.CONST.GAMES;
  }
  
  do {
    rand = Math.floor(Math.random() * games.length);
  } while(rand == game.getStoredRand());
  
  game.removeProtection();
  
  game.setStoredRand(rand);
  
  game.getHandler(games[rand], game.CONST.GT_ST)(game);
};
