var constants = require('../../../constants'),
    PF = constants.PFIELDS;

var addPoints = require('./../common/add_points');

var GameError = require('./../common/game_error');

// Симпатии, ждем, когда все ответят и переходим к показу результатов
module.exports = function(game) {
  return function (timer) {
    if (game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }
      
      // game._actionsQueue = { id : [ { pick - id other player }, {...} ], id : ... }
      
      var players = [], count = 0;
      
      for(var selfID in game._actionsQueue) if (game._actionsQueue.hasOwnProperty(selfID)) {
        var selfPicks = game._actionsQueue[selfID];
        
        for(var selfPickOptions = 0; selfPickOptions < selfPicks.length; selfPickOptions++) {
          var selfPick = selfPicks[selfPickOptions][PF.PICK];
          
          var otherPicks = game._actionsQueue[selfPick];
          if(otherPicks) {
            for(var otherPickOptions = 0; otherPickOptions < otherPicks.length; otherPickOptions++) {
              var otherPick = otherPicks[otherPickOptions][PF.PICK];
              if(otherPick && otherPick == selfID) {
                players.push(selfID);
              }
            }
          }
        }
      }
      
      if(players.length > 0) {
        addPoints(players[count], constants.SYMPATHY_POINTS, onComplete);
      }
      

      game._nextGame = constants.G_SYMPATHY_SHOW;

      // Сохраняем выбор игроков
      game._storedOptions = game._actionsQueue;

      // Очищаем настройки
      game._activePlayers = {};
      game._actionsQueue = {};

      // Все игроки могут посмотреть результаты всех
      game.activateAllPlayers();
      var countPrisoners = (game._prisoner === null)? 0 : 1;

      game.setActionLimit(game._room.getCountInRoom(constants.GIRL)
                  + game._room.getCountInRoom(constants.GUY) - 1 - countPrisoners);
      game._actionsCount = (game._room.getCountInRoom(constants.GIRL)
                  + game._room.getCountInRoom(constants.GUY) - countPrisoners) * 10;

      // Отправляем результаты
      var result = {};
      result[PF.NEXTGAME] = game._nextGame;
      result[PF.PLAYERS] = game.getPlayersID();
      result[PF.PRISON] = null;
      
      
      if(game._prisoner !== null) {
        result[PF.PRISON] = {};
        result[PF.PRISON][PF.ID]  = game._prisoner.id;
        result[PF.PRISON][PF.VID] = game._prisoner.vid;
        result[PF.PRISON][PF.SEX] = game._prisoner.sex;
      }

      game.emit(result);

      // Сохраняем состояние игры
      game._gameState = result;

      // Устанавливаем таймер
      game.startTimer(game._handlers[game._nextGame], constants.TIMEOUT_SYMPATHY_SHOW);
    }
    
    //---------------------
    function onComplete(err) {
      if(err) { return new GameError(constants.G_SYMPATHY, err.message); }
    
      count++;
      if(count < players.length) {
        addPoints(players[count], constants.SYMPATHY_POINTS, onComplete);
      }
    }
  }
};