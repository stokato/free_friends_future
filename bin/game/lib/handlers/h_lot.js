//var random = require('random-js')();
var constants = require('../../constants');
var constants_io = require('../../../io/constants');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits');

module.exports = function(game) {
  return function(timer, uid) {
    var f = constants_io.FIELDS;
    clearTimeout(game.gTimer);

    var rand;
    do {
      rand = Math.floor(Math.random() * constants.GAMES.length);
    } while(rand == game.gStoredRand);
    game.gStoredRand = rand;

    game.gNextGame = constants.GAMES[rand];

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
        activateAllPlayers(game.gRoom, game.gActivePlayers);

        setActionsLimit(game, 1);
        game.gActionsCount = constants.PLAYERS_COUNT;

        rand = Math.floor(Math.random() * constants.GAME_QUESTIONS.length);
        result[f.question] =  constants.GAME_QUESTIONS[rand];
        break;
      ////////////////////// КАРТЫ /////////////////////////////////////////////////////
      case constants.G_CARDS : // для карт ходят все
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers);

        setActionsLimit(game, 1);
        game.gActionsCount = constants.PLAYERS_COUNT;
        break;
      //////////////////// ЛУЧШИЙ ///////////////////////////////////////////////////////
      case constants.G_BEST : // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходят остальные
        var firstPlayer;
        if(uid) {
          firstPlayer = game.gActivePlayers[uid];
        } else {
          firstPlayer = randomPlayer(game.gRoom);
        }
        var firstGender = firstPlayer.getSex();
        var secondPlayer = randomPlayer(game.gRoom, firstGender, [firstPlayer.getID()]);

        var bestPlayers = [firstPlayer.getID(), secondPlayer.getID()];
        var bestPlayerInfo = [{id : firstPlayer.getID(), vid : firstPlayer.getVID()},
                              {id : secondPlayer.getID(), vid : secondPlayer.getVID()}];

        game.gStoredOptions = {};
        game.gStoredOptions[firstPlayer.getID()] = firstPlayer;
        game.gStoredOptions[secondPlayer.getID()] = secondPlayer;

        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers, bestPlayers);

        setActionsLimit(game, 1);
        game.gActionsCount = constants.PLAYERS_COUNT-2;

        result[f.best] = bestPlayerInfo;
        break;
      //////////////////// СИМПАТИИ ///////////////////////////////////////////////////////
      case constants.G_SYMPATHY:
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers);

        setActionsLimit(game, constants.SHOW_SYMPATHY_LIMIT);
        game.gActionsCount = constants.PLAYERS_COUNT * constants.SHOW_SYMPATHY_LIMIT;
        break;
    }
    /////////////////////////////////////////////////////////////////////////////////////
    result[f.players] = getPlayersID(game.gActivePlayers);

    var item, player;
    for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
      player = game.gActivePlayers[item];
      break;
    }
    game.emit(player.getSocket(), result);
    game.gameState = result;
    game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
  }
};
