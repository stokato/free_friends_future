/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const Config    = require('../../../../../config.json');
const constants = require('../../../../constants');

const onLot = require('../pickers/p_lot');

const PF          = constants.PFIELDS;
const LOT_TIMEOUT = Config.game.timeouts.lot;

module.exports = function (timer, socket, game) {
  clearTimeout(game._timer);
  
  // Если игроков недостаточно - останавливаем игру
  if(!game.checkCountPlayers()) {
    return game.stop();
  }
  
  // Если игрока в темнице нет в комнате - очищаем темницу
  // Получаем следующего игрока
  let nextPlayerInfo;
  if(game._nextGame != constants.G_PRISON) {
    if(game._prisoner) {
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
  game._onGame = onLot(game);
  
  // Отправляем результат
  let result = {
    [PF.NEXTGAME] : game._nextGame,
    [PF.PLAYERS]  : game.getPlayersID(),
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
  game.startTimer(game._onGame, LOT_TIMEOUT);
  
  if(game._onStart) {
    game._onStart();
  }
};