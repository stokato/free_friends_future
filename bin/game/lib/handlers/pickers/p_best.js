/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config        = require('./../../../../../config.json');
const oPool       = require('../../../../objects_pool');
const constants   = require('../../../../constants');

const addAction   = require('../../common/add_action');
const handleError = require('../../common/handle_error');
const finishBest  = require('../finishers/f_best');
const checkPrisoner = require('./../../common/check_prisoner');

const PF          = constants.PFIELDS;
const DEF_TIMEOUT    = Number(Config.game.timeouts.default);

module.exports = function (game, result) {
  
  let firstPlayer = null;
  if(uid) {
    firstPlayer = game._activePlayers[uid];
  } else {
    for(let item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
      firstPlayer = game._activePlayers[item];
    }
  }
  
  // Получаем второго игрока
  let firstGender = firstPlayer.sex;
  
  let excludeIds = [firstPlayer.id];
  
  if(game.getPrisonerInfo()){
    excludeIds.push(game.getPrisonerInfo().id);
  }
  
  if(game.getPrisonerInfo()) {
    excludeIds.push(game.getPrisonerInfo().id);
  }
  
  let randPlayer = game._room.randomProfile(firstGender, excludeIds);
  
  if(!randPlayer) {
    return game.stop();
  }
  
  // Получаем сведения
  let secondPlayer = game.getPlayerInfo(randPlayer);
  
  let bestPlayers = [firstPlayer.id, secondPlayer.id];
  let best1 = {
    [PF.ID]  : firstPlayer.id,
    [PF.VID] : firstPlayer.vid,
    [PF.SEX] : firstPlayer.sex
  };
  
  let best2 = {
    [PF.ID]  : secondPlayer.id,
    [PF.VID] : secondPlayer.vid,
    [PF.SEX] : secondPlayer.sex
  };
  
  
  let bestPlayerInfo = [best1, best2];
  
  // Сохраняем опции
  game._storedOptions = {};
  game._storedOptions[firstPlayer.id] = firstPlayer;
  game._storedOptions[secondPlayer.id] = secondPlayer;
  
  // Ходят все оставшиеся игроки по разу
  game._activePlayers = {};
  game.activateAllPlayers(bestPlayers);
  
  game.setActionLimit(1);
  
  let countPrisoners = (game._prisoner === null)? 0 : 1;
  game._actionsCount = game._currCountInRoom - countPrisoners - 2;
  game._actionsMain = game._actionsCount;
  
  result.best = bestPlayerInfo;
  
  result.players = game.getPlayersID();
  
  checkPrisoner(game, result);
  
  game.emit(result);
  game._gameState = result;
  
  // Устанавливаем таймаут
  game.startTimer(game._handlers[game._nextGame], DEF_TIMEOUT);
  
  return function (socket, options) {
    // Ошибка - если выбранного пользоателя нет среди кандидатов
    if(!game._storedOptions[options[PF.PICK]]) {
      return handleError(socket, constants.IO_GAME, constants.G_BEST, constants.errors.NO_THAT_PLAYER);
    }
  
    // Сохраняем ход игрока
    let uid = oPool.userList[socket.id].getID();
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
  
    // Статистика
    for(let item in game._storedOptions) if(game._storedOptions.hasOwnProperty(item)) {
      let profInfo  = game._storedOptions[item];
      if(options[PF.PICK] == profInfo.id) {
        if(!profInfo.picks) {
          profInfo.picks = 1;
        } else {
          profInfo.picks++;
        }
      }
    }
  
    // Оповещаем о ходе всех в комнате
    let playerInfo = game._activePlayers[uid];
  
    let result = {
      [PF.PICK] : {
        [PF.ID]   : uid,
        [PF.VID]  : playerInfo.vid,
        [PF.PICK] : options[PF.PICK]
      }
    };
  
    game.emit(result);
  
    // Сохраняем состояние игры
    if(!game._gameState[PF.PICKS]) {
      game._gameState[PF.PICKS] = [];
    }
    game._gameState[PF.PICKS].push(result[PF.PICK]);
  
    if(game._actionsCount == 0) {
      finishBest(false, socket, game);
    }
  }
};