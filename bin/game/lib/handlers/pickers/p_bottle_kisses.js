/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config      = require('./../../../../../config.json');
const constants   = require('../../../../constants');
const oPool       = require('./../../../../objects_pool');
const stat        = require('./../../../../stat_manager');

const checkPrisoner       = require('./../../common/check_prisoner');
const addAction           = require('./../../common/add_action');
const finishBottleKisses  = require('./../finishers/f_bottle_kisses');

const DEF_TIMEOUT = Number(Config.game.timeouts.default);
const PF          = constants.PFIELDS;

module.exports = function (game, result = {}) {
  
  let rand = Math.floor(Math.random() * game._storedOptions.length);
  let secondPlayerInfo = game._storedOptions[rand];
  
  // Разрешаем второму игроку ходить
  game._activePlayers[secondPlayerInfo.id] = secondPlayerInfo;
  
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
  
  checkPrisoner(game, result);
  
  game.emit(result);
  game._gameState = result;
  
  // Устанавливаем таймаут
  game.startTimer(game._handlers[game._nextGame], DEF_TIMEOUT);
  
  return function (socket, options) {
    let uid = oPool.userList[socket.id].getID();
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
    addAction(game, uid, options);
  
    // Статистика
    for(let item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
      let profInfo  = game._activePlayers[item];
      if(uid != profInfo.id && options[PF.PICK] == true) {
        stat.setUserStat(profInfo.id, profInfo.vid, constants.SFIELDS.BOTTLE_KISSED, 1);
      }
    }
  
    // Отправляем всем выбор игрока
    let playerInfo = game._activePlayers[uid];
  
    let result = {
      [PF.ID]   : uid,
      [PF.VID]  : playerInfo.vid,
      [PF.PICK] : options[PF.PICK]
    };
    
    game.emit(result);
  
    if(!game._gameState[PF.PICKS]) { game._gameState[PF.PICKS] = []; }
    game._gameState[PF.PICKS].push(result);
  
    if(game._actionsCount == 0) {
      finishBottleKisses(false, socket, game);
    }
  }
};