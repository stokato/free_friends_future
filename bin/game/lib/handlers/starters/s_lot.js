/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config    = require('../../../../../config.json');
const constants = require('../../../../constants');
const oPool     = require('./../../../../objects_pool');

const addAction = require('./../../common/add_action');
const finishLot = require('./../finishers/f_lot');

const  PF              = constants.PFIELDS;
const LOT_TIMEOUT = Config.game.timeouts.lot;

module.exports = function(game) {
  

  // Получаем следующего игрока
  let nextPlayerInfo;
  
  // Проверка - чтобы не убирать из тюрьмы сразу после попадания в нее
  if(game._nextGame != constants.G_PRISON) {
    if(game._prisoner) {
      
      // Если игрок, попавший за решетку, вышел из комнаты, очищаем тюрьму
      if(!game._room.isProfile(game._prisoner.id)) {
        game._prisoner = null;
      }
    }
    nextPlayerInfo = game.getNextPlayer(true);
  } else {
    nextPlayerInfo = game.getNextPlayer(false);
  }
  
  // Очищаем настройки
  game._activePlayers = {};
  game._actionsQueue = {};
  
  // Игрок 1 и ходит 1 раз
  game._activePlayers[nextPlayerInfo.id] = nextPlayerInfo;
  game.setActionLimit(1);
  game._actionsCount = 1;
  
  // Следующий этап - волчек
  game._nextGame = constants.G_LOT;
  
  // Отправляем результат
  let result = {
    [PF.NEXTGAME] : game._nextGame,
    [PF.PLAYERS]  : game.getPlayersID(),
    [PF.PRISON]   : null
  };
  
  game.checkPrisoner(result);
  
  game.emit(result);
  game._gameState = result;
  
  // Устанавливаем таймаут
  game.startTimer(game._handlers.finishers.finishLot, LOT_TIMEOUT, game);
  
  // Обработчик выбора игрока
  game._onGame = function(socket, options) {
  
    let uid = oPool.userList[socket.id].getID();
  
    if (!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
    
    if(game._actionsCount == 0) {
      game._handlers.finishers.finishLot(false, socket, game);
    }
  }
};
