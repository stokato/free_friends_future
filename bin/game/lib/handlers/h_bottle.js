var constants = require('../../../constants');

// Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
module.exports = function(game) {
  return function(timer, uid) {
    if(!timer) { clearTimeout(game.gTimer); }

    if(!game.checkCountPlayers()) {
      return game.stop();
    }

    // Получаем данные по первому игроку
    var firstPlayerInfo = null;
    if(uid) {
      firstPlayerInfo = game.gActivePlayers[uid];
    } else { // В случае, если игрок так и не покрутил волчек, берем его uid из настроек
      for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        firstPlayerInfo = game.gActivePlayers[item];
      }
    }

    // Выбираем второго игрока
    var firstGender = firstPlayerInfo.sex;
    var male = constants.GUY;
    var female = constants.GIRL;

    var secondGender = (firstGender == male)? female : male;
    var secondPlayer = game.getRandomPlayer(secondGender);

    if(!secondPlayer) {
      return game.stop();
    }

    // Разрешаем второму игроку ходить
    game.gActivePlayers[secondPlayer.getID()] = game.getPlayerInfo(secondPlayer);

    // Оба могут ответить по разу
    game.gActionsQueue = {};
    game.setActionLimit(1);
    game.gActionsCount = 2;

    game.gNextGame = constants.G_BOTTLE_KISSES;

    // Отправляем результаты
    var result = {};
    result.players = game.getPlayersID();
    result.next_game = constants.G_BOTTLE_KISSES;

    result.prison = null;
    if(game.gPrisoner !== null) {
      result.prison = {
        id : game.gPrisoner.id,
        vid: game.gPrisoner.vid,
        sex: game.gPrisoner.sex
      }
    }

    game.emit(result);
    game.gameState = result;

    // Устанавливаем таймаут
    game.startTimer(game.gHandlers[game.gNextGame], constants.TIMEOUT_GAME);
  }
};
