var async = require('async');

var GameError = require('./../../../game_error'),
    checkInput = require('./../../../check_input');
var constants = require('../../constants');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits');

var constants_io = require('../../../io/constants');

// Бутылочка поцелуи, сообщаем всем выбор пары
module.exports = function(game) {
  return function (timer, uid, options) {
    var f = constants_io.FIELDS;
    var player;
    if(uid) {
      player = game.gActivePlayers[uid];

      var result = {};
      result[f.id] = uid;
      result[f.pick] = options[f.pick];
      game.emit(player.getSocket(), result);
    }

    if (game.gActionsCount == 0 || timer) {
      var item, allKissed = true;
      for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        player  = game.gActivePlayers[item];
        if(!game.gActionsQueue[player.getID()][0][f.pick]) {
          allKissed = false;
        }
      }

      if(allKissed) {
        var players = [];
        for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
          if(!game.gActionsQueue[game.gActivePlayers[item].getID()][0][f.pick]) {
            players.push(game.gActivePlayers[item]);
          }
        }
        async.map(players, function(player, cb) {
          player.addPoints(1, function(err, res) {
            if(err) {
              new GameError(player.getSocket(),
                constants.G_BOTTLE_KISSES, "Ошбика при начислении очков пользователю");
              return cb(err, null);
            }

            cb(null, null);
          });
        },
        function(err, res) {
          if(err) { game.stop(); }

          setNextGame(game);
        })
      } else { setNextGame(game); }
    }
  }
};

function setNextGame(game) {
  if(!timer) { clearTimeout(game.gTimer); }

  game.gNextGame = constants.G_START;

  game.gActionsQueue = {};
  game.gActivePlayers = {};

  pushAllPlayers(game.gRoom, game.gActivePlayers);
  setActionsLimit(game, 1);
  game.gActionsCount = constants.PLAYERS_COUNT;

  game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
}