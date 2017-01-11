/**
 * Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
 *
 * @param timer - признак - запущено таймером, socket, options - объект с выбором игрока
 */

const Config        = require('./../../../../config.json');

const constants   = require('../../../constants'),
    PF          = constants.PFIELDS,
    addAction   = require('./../common/add_action'),
    oPool       = require('./../../../objects_pool');

const DEF_TIMEOUT = Number(Config.game.timeouts.default);

module.exports = function(game) {
  return function(timer, socket, options) {
    
    let uid;
    
    // Если вызов произведен игроком - сохраняем его выбор и останавливаем таймер
    if(!timer) {
      uid = oPool.userList[socket.id].getID();
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
  
      addAction(game, uid, options);
      
      clearTimeout(game._timer);
    }

    // Если пользователей недостаточно - останавливаем игру
    // if(!game.checkCountPlayers()) {
    //   return game.stop();
    // }

    // Получаем данные по первому игроку
    let firstPlayerInfo = null;
    if(uid) {
      firstPlayerInfo = game._activePlayers[uid];
    } else { // В случае, если игрок так и не покрутил волчек, берем его uid из настроек
      for(let item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        firstPlayerInfo = game._activePlayers[item];
      }
    }

    // Выбираем второго игрока
    let firstGender = firstPlayerInfo.sex;
    let male = constants.GUY;
    let female = constants.GIRL;

    let secondGender = (firstGender == male)? female : male;

    let excludeIDs = [];
    if(game.getPrisonerInfo()) {
      excludeIDs.push(game.getPrisonerInfo().id);
    }

    // let secondPlayer = game._room.randomProfile(secondGender, excludeIDs);
    let rand = Math.floor(Math.random() * game._storedOptions.length);
    let secondPlayer = game._storedOptions[rand];

    // if(!secondPlayer) {
    //   return game.stop();
    // }

    // Разрешаем второму игроку ходить
    game._activePlayers[secondPlayer.getID()] = game.getPlayerInfo(secondPlayer);

    // Оба могут ответить по разу
    game._actionsQueue = {};
    game.setActionLimit(1);
    game._actionsCount = 2;
    game._actionsMain = game._actionsCount;
    

    game._nextGame = constants.G_BOTTLE_KISSES;

    // Отправляем результаты
    let result = {
      [PF.PLAYERS]  : game.getPlayersID(),
      [PF.NEXTGAME] : constants.G_BOTTLE_KISSES,
      [PF.PRISON]   : null
    };

    
    if(game._prisoner !== null) {
  
      result[PF.PRISON] = {
        [PF.ID]  : game._prisoner.id,
        [PF.VID] : game._prisoner.vid,
        [PF.SEX] : game._prisoner.sex
      };
      
    }

    game.emit(result);
    game._gameState = result;

    // Устанавливаем таймаут
    game.startTimer(game._handlers[game._nextGame], DEF_TIMEOUT);
  }
};
