var constants = require('../../../constants');

var addPoints = require('./../common/add_points');

var GameError = require('./../../../game_error');

// Симпатии, ждем, когда все ответят и переходим к показу результатов
module.exports = function(game) {
  return function (timer) {
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }
      
      // game.gActionsQueue = { id : [ { pick - id other player }, {...} ], id : ... }
      
      var players = [], count = 0;
      
      for(var selfID in game.gActionsQueue) if (game.gActionsQueue.hasOwnProperty(selfID)) {
        var selfPicks = game.gActionsQueue[selfID];
        
        for(var selfPickOptions = 0; selfPickOptions < selfPicks.length; selfPickOptions++) {
          var selfPick = selfPicks[selfPickOptions].pick;
          
          var otherPicks = game.gActionsQueue[selfPick];
          if(otherPicks) {
            for(var otherPickOptions = 0; otherPickOptions < otherPicks.length; otherPickOptions++) {
              var otherPick = otherPicks[otherPickOptions].pick;
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
      

      game.gNextGame = constants.G_SYMPATHY_SHOW;

      // Сохраняем выбор игроков
      game.gStoredOptions = game.gActionsQueue;

      // Очищаем настройки
      game.gActivePlayers = {};
      game.gActionsQueue = {};

      // Все игроки могут посмотреть результаты всех
      game.activateAllPlayers();
      var countPrisoners = (game.gPrisoner === null)? 0 : 1;

      game.setActionLimit(game.gRoom.girls_count + game.gRoom.guys_count - 1 - countPrisoners);
      game.gActionsCount = (game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners) * 10;

      // Отправляем результаты
      var result = {
        next_game   : game.gNextGame,
        players     : game.getPlayersID(),
        prison      : null
      };
      
      if(game.gPrisoner !== null) {
        result.prison = {
          id : game.gPrisoner.id,
          vid: game.gPrisoner.vid,
          sex: game.gPrisoner.sex
        }
      }

      game.emit(result);

      // Сохраняем состояние игры
      game.gameState = result;

      // Устанавливаем таймер
      game.startTimer(game.gHandlers[game.gNextGame], constants.TIMEOUT_SYMPATHY_SHOW);
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