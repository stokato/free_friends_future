//var random = require('random-js')();
var constants = require('../../constants');
var constants_io = require('../../../io/constants');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits'),
  getPlayerInfo  = require('./../get_player_info'),
  getPrison  = require('./../get_prison');

module.exports = function(game) {
  return function(timer, uid) {
    var f = constants_io.FIELDS;
    clearTimeout(game.gTimer);

    var rand, item;
   // do {
   //   rand = Math.floor(Math.random() * constants.GAMES.length);
   // } while(rand == game.gStoredRand || (game.gRoom.guys_count + game.gRoom.girls_count);
   // game.gStoredRand = rand;
   //
   //game.gNextGame = constants.GAMES[rand];

    var ok = false;
    while(!ok) {
      ok = true;
      game.gNextGame = constants.GAMES[game.gameCounter];
      game.gameCounter++;
      if(game.gameCounter == constants.GAMES.length) {
        game.gameCounter = 0;
      }

      if(game.gNextGame == constants.G_PRISON) {
        if(game.gRoom.girls_count <= 2 ||  game.gRoom.guys_count <= 2) {
          ok = false;
        }
        if(game.countPrisoners > 0) {
          ok = false;
        }
      }
    }



    game.gActionsQueue = {};

    var result = {};
    result[f.next_game] = game.gNextGame;
   // result[f.game] = constants.G_LOT;
    result[f.players] = [];

    switch (game.gNextGame) {
      /////////////////////// БУТЫЛОЧКА //////////////////////////////////////////
      case constants.G_BOTTLE :    // для бутылочки ходит тот же, кто крутил вочек
        game.gActionsCount = 1;
        setActionsLimit(game, 1);
        break;
      ////////////////////// ВОПРОСЫ ////////////////////////////////////////////////////
      case constants.G_QUESTIONS : // для вопросов ходят все, отвечая на произовльный вопрос
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers, null, game.gPrisoners);

        setActionsLimit(game, 1);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - game.countPrisoners; // constants.PLAYERS_COUNT;

        var questions = game.getQuestions();
        rand = Math.floor(Math.random() * questions.length);
        result[f.question] =  questions[rand].text;
        break;
      ////////////////////// КАРТЫ /////////////////////////////////////////////////////
      case constants.G_CARDS : // для карт ходят все
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers, null, game.gPrisoners);

        setActionsLimit(game, 1);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - game.countPrisoners; // constants.PLAYERS_COUNT;
        break;
      //////////////////// ЛУЧШИЙ ///////////////////////////////////////////////////////
      case constants.G_BEST : // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходят остальные

        var firstPlayer = null;
        if(uid) {
          firstPlayer = game.gActivePlayers[uid];
        } else {
          for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
            firstPlayer = game.gActivePlayers[item];
          }
        }

        var firstGender = firstPlayer.sex;
        var randPlayer = randomPlayer(game.gRoom, firstGender, [firstPlayer.id], game.gPrisoners);
        if(!randPlayer) {
          return game.stop();
        }
        var secondPlayer = getPlayerInfo(randPlayer);

        var bestPlayers = [firstPlayer.id, secondPlayer.id];
        var bestPlayerInfo = [{id : firstPlayer.id, vid : firstPlayer.vid, sex : firstPlayer.sex },
                              {id : secondPlayer.id, vid : secondPlayer.vid, sex : secondPlayer.sex }];

        game.gStoredOptions = {};
        game.gStoredOptions[firstPlayer.id] = firstPlayer;
        game.gStoredOptions[secondPlayer.id] = secondPlayer;

        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers, bestPlayers, game.gPrisoners);

        setActionsLimit(game, 1);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - game.countPrisoners; // constants.PLAYERS_COUNT-2;

        result[f.best] = bestPlayerInfo;
        break;
      //////////////////// СИМПАТИИ ///////////////////////////////////////////////////////
      case constants.G_SYMPATHY:
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers, null, game.gPrisoners);

        setActionsLimit(game, constants.SHOW_SYMPATHY_LIMIT);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - game.countPrisoners; // constants.PLAYERS_COUNT * constants.SHOW_SYMPATHY_LIMIT;
        break;
      //////////////////// ТЮРЬМА ///////////////////////////////////////////////////////
      case constants.G_PRISON:

        game.gActionsCount = 1;
        setActionsLimit(game, 1);

        break;
    }
    /////////////////////////////////////////////////////////////////////////////////////
    result[f.players] = getPlayersID(game.gActivePlayers);

    result.prison = getPrison(game.gPrisoners);

    var player = randomPlayer(game.gRoom, null, null, game.gPrisoners);
    if(!player) {
      return game.stop();
    }

    game.emit(player.getSocket(), result);
    game.gameState = result;
    game.gTimer = startTimer(game.gHandlers[game.gNextGame], constants.TIMEOUT * 1000);
  }
};
