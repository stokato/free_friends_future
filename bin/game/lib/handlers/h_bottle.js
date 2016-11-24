var constants = require('../../../constants'),
    PF = constants.PFIELDS;

// Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
module.exports = function(game) {
  return function(timer, uid) {
    if(!timer) { clearTimeout(game._timer); }

    if(!game.checkCountPlayers()) {
      return game.stop();
    }

    // Получаем данные по первому игроку
    var firstPlayerInfo = null;
    if(uid) {
      firstPlayerInfo = game._activePlayers[uid];
    } else { // В случае, если игрок так и не покрутил волчек, берем его uid из настроек
      for(var item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        firstPlayerInfo = game._activePlayers[item];
      }
    }

    // Выбираем второго игрока
    var firstGender = firstPlayerInfo.sex;
    var male = constants.GUY;
    var female = constants.GIRL;

    var secondGender = (firstGender == male)? female : male;
    var secondPlayer = game._room.randomProfile(secondGender);

    if(!secondPlayer) {
      return game.stop();
    }

    // Разрешаем второму игроку ходить
    game._activePlayers[secondPlayer.getID()] = game.getPlayerInfo(secondPlayer);

    // Оба могут ответить по разу
    game._actionsQueue = {};
    game.setActionLimit(1);
    game._actionsCount = 2;

    game._nextGame = constants.G_BOTTLE_KISSES;

    // Отправляем результаты
    var result = {};
    result[PF.PLAYERS]  = game.getPlayersID();
    result[PF.NEXTGAME] = constants.G_BOTTLE_KISSES;
    result[PF.PRISON] = null;
    
    if(game._prisoner !== null) {
  
      result[PF.PRISON] = {};
      result[PF.PRISON][PF.ID]  = game._prisoner.id;
      result[PF.PRISON][PF.VID] = game._prisoner.vid;
      result[PF.PRISON][PF.SEX] = game._prisoner.sex;
      
    }

    game.emit(result);
    game._gameState = result;

    // Устанавливаем таймаут
    game.startTimer(game._handlers[game._nextGame], constants.TIMEOUT_GAME);
  }
};
