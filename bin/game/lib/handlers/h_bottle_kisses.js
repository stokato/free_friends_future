var GameError = require('./../../../game_error'),
    checkInput = require('./../../../check_input');
var constants = require('../../constants');

var profilejs =  require('../../../profile/index');

//var
//    randomPlayer = require('../random_player'),
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
    if(uid) { // Отправляем всем выбор игрока
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

    // Если все игроки сделали выбор, проверяем - оба ли поцеловали
    if (game.gActionsCount == 0 || timer) {
      var item, allKissed = true;
      for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        playerInfo  = game.gActivePlayers[item];
        if(!game.gActionsQueue[playerInfo.id] || !game.gActionsQueue[playerInfo.id][0][f.pick]) {
          allKissed = false;
        }
      }

      // Если оба поцеловали друг друга, нужно добавить им очки, получаем данные игроков
      if(allKissed) {
        var players = [];
        for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
          //if(!game.gActionsQueue[game.gActivePlayers[item].getID()][0][f.pick])
            players.push(game.gActivePlayers[item]);
          //}
        }

        var count = 0; // Добавляем очки
        addPoints(game.userList, players, count, function(err, res) {
          if(err) {
            game.stop();
            //var player = randomPlayer(game.gRoom, null);

            return;// new GameError(player.getSocket(), constants.G_BOTTLE_KISSES,
              //"Ошибка при начислении очков пользователю");
          }

          if(!timer) { clearTimeout(game.gTimer); }

          game.restoreGame();
        });
      } else {
        if(!timer) { clearTimeout(game.gTimer); }

        game.restoreGame();
      }
    }
  }
};

// Функция проверяет, если игрок не онлайн, создает его профиль.
// Добавляет всем очки
function addPoints(userList, playersInfo, count, callback) {
  var player = userList[playersInfo[count].socketId];
  if(player) {
    player.addPoints(1, onPoints(userList, playersInfo, count, player, callback));
  } else {
    player = new profilejs();
    player.build(playersInfo[count].id, function (err, info) {
      if(err) {
        new GameError(playersInfo[count].getSocket(),
          constants.G_BOTTLE_KISSES, "Ошибка при создании профиля игрока");
        return callback(err, null);
      }

      player.addPoints(constants.KISS_POINTS, onPoints(userList, playersInfo, count, player, callback));
    });
  }
}

// Функция обрабатывает результы начисления очков, оповещает игрока
// Если есть еще игрок, вызвает начисления очков для него
function onPoints(userList, playersInfo, count, player, callback) {
  return function(err, res) {
    if(err) {
      new GameError(playersInfo[count].getSocket(),
        constants.G_BOTTLE_KISSES, "Ошибка при начислении очков пользователю");
      return callback(err, null);
    }

    count++;

    var options = {};
    options[constants_io.FIELDS.points] = res;

    var playerSocket = player.getSocket();
    playerSocket.emit(constants_io.IO_ADD_POINTS, options);

    if(count < playersInfo.length) {
      addPoints(userList, playersInfo, count, callback);
    } else {
      callback(null, null);
    }
  }
}
