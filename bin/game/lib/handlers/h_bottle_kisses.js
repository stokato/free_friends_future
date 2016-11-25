var GameError = require('./../common/game_error'),
    constants = require('../../../constants'),
    PF        = constants.PFIELDS,
    addPoints = require('./../common/add_points');
var addAction = require('./../common/add_action');
var oPool = require('./../../../objects_pool');

// Бутылочка поцелуи, сообщаем всем выбор пары
module.exports = function(game) {
  return function (timer, socket, options) {
  
    if(!timer) {
      var uid = oPool.userList[socket.id].getID();
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
      addAction(game, uid, options);
  
      // Отправляем всем выбор игрока
      var playerInfo = game._activePlayers[uid];
  
      var result = {};
      result[PF.ID] = uid;
      result[PF.VID] = playerInfo.vid;
      result[PF.PICK] = options[PF.PICK];
  
      game.emit(result);
  
      if(!game._gameState[PF.PICKS]) { game._gameState[PF.PICKS] = []; }
      game._gameState[PF.PICKS].push(result);
    }
    
    //------------------------------------------------------------------------------------
    // Если все игроки сделали выбор, проверяем - оба ли поцеловали
    if (game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }
  
      var count = 0, players = [];

      var item, allKissed = true;
      for(item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        var pInf  = game._activePlayers[item];
        if(!game._actionsQueue[pInf.id] || !game._actionsQueue[pInf.id][0][PF.PICK] === true) {
          allKissed = false;
        }
      }

      // Если оба поцеловали друг друга, нужно добавить им очки, получаем данные игроков
      if(allKissed) {
        for(item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
          players.push(game._activePlayers[item]);
        }
        addPoints(players[count].id, constants.KISS_POINTS, onComplete);
      }
  
      game.restoreGame(null, true);
    }

    //----------------
    function onComplete(err) {
      if(err) { return new GameError(constants.G_BOTTLE_KISSES, err.message); }
      
      count++;
      if(count < players.length) {
        addPoints(players[count].id, constants.KISS_POINTS, onComplete);
      }
    }

  }
};


