var GameError = require('./../../../game_error');
var constants = require('../../../constants');
// var ProfileJS =  require('../../../profile/index');
// var handleError = require('../../../handle_error');
var addPoints = require('./../common/add_points');

// Бутылочка поцелуи, сообщаем всем выбор пары
module.exports = function(game) {
  return function (timer, uid, options) {

    if(uid) { // Отправляем всем выбор игрока
      broadcastPick(uid);
    }

    var count = 0, players = [];

    // Если все игроки сделали выбор, проверяем - оба ли поцеловали
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      var playerInfo, item, allKissed = true;
      for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        playerInfo  = game.gActivePlayers[item];
        if(!game.gActionsQueue[playerInfo.id] || !game.gActionsQueue[playerInfo.id][0].pick === true) {
          allKissed = false;
        }
      }

      // Если оба поцеловали друг друга, нужно добавить им очки, получаем данные игроков
      if(allKissed) {
        for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
          players.push(game.gActivePlayers[item]);
        }
        addPoints(players[count].id, constants.KISS_POINTS, onComplete);
      }
  
      game.restoreGame(null, true);
    }

    //----------------
    function broadcastPick(uid) {
      var playerInfo = game.gActivePlayers[uid];

      var result = {
        id   : uid,
        vid  : playerInfo.vid,
        pick : options.pick
      };
      game.emit(result);

      if(!game.gameState.picks) { game.gameState.picks = []; }
      game.gameState.picks.push(result);
    }

    function onComplete(err) {
      if(err) { return new GameError(constants.G_BOTTLE_KISSES, err.message); }
      
      count++;
      if(count < players.length) {
        addPoints(players[count].id, constants.KISS_POINTS, onComplete);
      }
    }

  }
};


