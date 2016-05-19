var GameError = require('./../../../game_error'),
    checkInput = require('./../../../check_input');
var constants = require('../../constants');

var
    randomPlayer = require('../random_player');
    // startTimer   = require('../start_timer'),
    //pushAllPlayers = require('../activate_all_players'),
  //getPlayersID = require('../get_players_id'),
    //setActionsLimit = require('../set_action_limits');

var constants_io = require('../../../io/constants');

// Бутылочка поцелуи, сообщаем всем выбор пары
module.exports = function(game) {
  return function (timer, uid, options) {
    var f = constants_io.FIELDS;
    var playerInfo;
    if(uid) {
      playerInfo = game.gActivePlayers[uid];

      var result = {};
      result[f.id] = uid;
      result[f.vid] = playerInfo.vid;
      result[f.pick] = options[f.pick];
      //result[f.game] = constants.G_BOTTLE_KISSES;

      game.emit(playerInfo.player.getSocket(), result);

      if(!game.gameState[f.picks]) { game.gameState[f.picks] = []; }
      game.gameState[f.picks].push(result);

    }

    // Если все игроки сделали выбор
    if (game.gActionsCount == 0 || timer) {
      var item, allKissed = true;
      for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        playerInfo  = game.gActivePlayers[item];
        if(!game.gActionsQueue[playerInfo.id] || !game.gActionsQueue[playerInfo.id][0][f.pick]) {
          allKissed = false;
        }
      }

      // Если оба поцеловали друг друга, нужно добавить им очки
      if(allKissed) {
        var players = [];
        for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
          //if(!game.gActionsQueue[game.gActivePlayers[item].getID()][0][f.pick]) {
            players.push(game.gActivePlayers[item].player);
          //}
        }

        var count = 0;
        addPoints(players, count, function(err, res) {
          if(err) { game.stop(); }

          setNextGame(game, timer);
        });
      } else { setNextGame(game, timer); }
    }
  }
};

function setNextGame(game, timer) {
  if(!timer) { clearTimeout(game.gTimer); }

  //var f = constants_io.FIELDS;
  //
  //game.gNextGame = constants.G_LOT;
  //
  //game.gActionsQueue = {};
  //game.gActivePlayers = {};
  //
  //pushAllPlayers(game.gRoom, game.gActivePlayers);
  //setActionsLimit(game, 1);
  //game.gActionsCount = constants.PLAYERS_COUNT;

  //var result = {};
  //result[f.next_game] = game.gNextGame;
  ////result[f.players] = getPlayersID(game.gActivePlayers);
  //
  //var nextPlayer = randomPlayer(game.gRoom, null);
  //result[f.players] = [{id: nextPlayer.getID(), vid: nextPlayer.getVID()}];
  //
  //var item, player;
  //for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
  //  player = game.gActivePlayers[item];
  //  break;
  //}
  //
  //game.emit(player.getSocket(), result);
  //game.gameState = result;

  game.restoreGame();

  //game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
}

function addPoints(players, count, callback) {
  players[count].addPoints(1, function(err, res) {
    if(err) {
      new GameError(players[count].getSocket(),
        constants.G_BOTTLE_KISSES, "Ошбика при начислении очков пользователю");
      return callback(err, null);
    }

    count++;

    if(count < players.length) {
      addPoints(players, count, callback);
    } else {
      callback(null, null);
    }
  });
}