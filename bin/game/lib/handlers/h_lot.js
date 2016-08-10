
var constants = require('../../constants');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits'),
  getPlayerInfo  = require('./../get_player_info'),
  checkCountPlayers = require('./../check_count_players'),
  getRandomQuestion = require('./../get_random_question');

module.exports = function(game) {
  return function(timer, uid) {
    clearTimeout(game.gTimer);

    var timeout = constants.TIMEOUT_GAME;

    if(!checkCountPlayers(game)) {
      return game.stop();
    }

    var rand;
    var games = (game.gPrisoner !== null ||
                  game.gRoom.girls_count <= 2 ||
                    game.gRoom.guys_count <= 2)? constants.GAMES_WITHOUT_PRISON : constants.GAMES;

    do {
      rand = Math.floor(Math.random() * games.length);
    } while(rand == game.gStoredRand);

    game.gStoredRand = rand;

    game.gNextGame = games[rand];

    game.gActionsQueue = {};

    var result = {};
    result.next_game = game.gNextGame;
    result.players = [];

    var countPrisoners = (game.gPrisoner === null)? 0 : 1;

    switch (game.gNextGame) {
      /////////////////////// БУТЫЛОЧКА //////////////////////////////////////////
      case constants.G_BOTTLE :    // для бутылочки ходит тот же, кто крутил вочек
        game.gActionsCount = 1;
        setActionsLimit(game, 1);
        break;
      ////////////////////// ВОПРОСЫ ////////////////////////////////////////////////////
      case constants.G_QUESTIONS : // для вопросов ходят все, отвечая на произовльный вопрос
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers, null, game.gPrisoner);

        setActionsLimit(game, 1);

        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners; // constants.PLAYERS_COUNT;

        result.question =  getRandomQuestion(game);
        break;
      ////////////////////// КАРТЫ /////////////////////////////////////////////////////
      case constants.G_CARDS : // для карт ходят все
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers, null, game.gPrisoner);

        setActionsLimit(game, 1);

        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners; // constants.PLAYERS_COUNT;
        break;
      //////////////////// ЛУЧШИЙ ///////////////////////////////////////////////////////
      case constants.G_BEST : // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходят остальные

        var firstPlayer = null;
        if(uid) {
          firstPlayer = game.gActivePlayers[uid];
        } else {
          for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
            firstPlayer = game.gActivePlayers[item];
          }
        }

        var firstGender = firstPlayer.sex;
        var randPlayer = randomPlayer(game.gRoom, firstGender, [firstPlayer.id], game.gPrisoner);
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
        activateAllPlayers(game.gRoom, game.gActivePlayers, bestPlayers, game.gPrisoner);

        setActionsLimit(game, 1);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners; // constants.PLAYERS_COUNT-2;

        result.best = bestPlayerInfo;
        break;
      //////////////////// СИМПАТИИ ///////////////////////////////////////////////////////
      case constants.G_SYMPATHY:
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers, null, game.gPrisoner);

        setActionsLimit(game, constants.SHOW_SYMPATHY_LIMIT);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners; // constants.PLAYERS_COUNT * constants.SHOW_SYMPATHY_LIMIT;
        break;
      //////////////////// ТЮРЬМА ///////////////////////////////////////////////////////
      case constants.G_PRISON:

        game.gActionsCount = 1;
        setActionsLimit(game, 1);

        timeout = constants.TIMEOUT_PRISON;
        break;
    }
    /////////////////////////////////////////////////////////////////////////////////////
    result.players = getPlayersID(game.gActivePlayers);


    if(game.gPrisoner !== null) {
      result.prison = {
        id : game.gPrisoner.id,
        vid: game.gPrisoner.vid,
        sex: game.gPrisoner.sex
      }
    } else {
      result.prison = null;
    }

    var player = randomPlayer(game.gRoom, null, null, game.gPrisoner);

    if(!player) {  return game.stop();  }

    game.emit(player.getSocket(), result);
    game.gameState = result;
    game.gTimer = startTimer(game.gHandlers[game.gNextGame], timeout);
  }
};
