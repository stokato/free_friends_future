//var random = require('random-js')();
var constants = require('../../constants');
var constants_io = require('../../../io/constants');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits'),
  getPlayerInfo  = require('./../get_player_info');

module.exports = function(game) {
  return function(timer, uid) {
    var f = constants_io.FIELDS;
    clearTimeout(game.gTimer);

    var rand;
    do {
      rand = Math.floor(Math.random() * constants.GAMES.length);
    } while(rand == game.gStoredRand);
    game.gStoredRand = rand;

   // game.gNextGame = constants.GAMES[rand];
    game.gNextGame = constants.G_QUESTIONS;

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

        //if(!uid || !this.isPlayerInRoom(uid)) {
        //  player = randomPlayer(this.gRoom, null);
        //
        //  game.gActivePlayers = {};
        //
        //  game.gActivePlayers[player.getID()] = game.getPlayerInfo(player);
        //}

        break;
      ////////////////////// ВОПРОСЫ ////////////////////////////////////////////////////
      case constants.G_QUESTIONS : // для вопросов ходят все, отвечая на произовльный вопрос
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers);

        setActionsLimit(game, 1);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count; // constants.PLAYERS_COUNT;

        var questions = game.getQuestions();
        rand = Math.floor(Math.random() * questions.length);
        result[f.question] =  questions[rand].text;
        break;
      ////////////////////// КАРТЫ /////////////////////////////////////////////////////
      case constants.G_CARDS : // для карт ходят все
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers);

        setActionsLimit(game, 1);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count; // constants.PLAYERS_COUNT;
        break;
      //////////////////// ЛУЧШИЙ ///////////////////////////////////////////////////////
      case constants.G_BEST : // для игры "лучший" выбираем произвольно пару к игроку того же пола, ходят остальные

        //var firstPlayer;
        //if(!uid ||  !this.isPlayerInRoom(uid)) {
        //  firstPlayer = randomPlayer(game.gRoom);
        //} else {
        //  firstPlayer = game.gActivePlayers[uid].player;
        //}
        //
        var firstPlayer = null;
        if(uid) {
          firstPlayer = game.gActivePlayers[uid];
        } else {
          for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
            firstPlayer = game.gActivePlayers[item];
          }
        }

        var firstGender = firstPlayer.sex;
        var randPlayer = randomPlayer(game.gRoom, firstGender, [firstPlayer.id]);
        if(!randPlayer) {
          return game.stop();
        }
        var secondPlayer = getPlayerInfo(randPlayer);

        var bestPlayers = [firstPlayer.id, secondPlayer.id];
        var bestPlayerInfo = [{id : firstPlayer.id, vid : firstPlayer.vid},
                              {id : secondPlayer.id, vid : secondPlayer.vid}];

        game.gStoredOptions = {};
        game.gStoredOptions[firstPlayer.id] = firstPlayer;
        game.gStoredOptions[secondPlayer.id] = secondPlayer;

        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers, bestPlayers);

        setActionsLimit(game, 1);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count; // constants.PLAYERS_COUNT-2;

        result[f.best] = bestPlayerInfo;
        break;
      //////////////////// СИМПАТИИ ///////////////////////////////////////////////////////
      case constants.G_SYMPATHY:
        game.gActivePlayers = {};
        activateAllPlayers(game.gRoom, game.gActivePlayers);

        setActionsLimit(game, constants.SHOW_SYMPATHY_LIMIT);
        game.gActionsCount = game.gRoom.girls_count + game.gRoom.guys_count; // constants.PLAYERS_COUNT * constants.SHOW_SYMPATHY_LIMIT;
        break;
    }
    /////////////////////////////////////////////////////////////////////////////////////
    result[f.players] = getPlayersID(game.gActivePlayers);

    //var item, player;
    //for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
    //  player = game.gActivePlayers[item];
    //  break;
    //}
    var player = randomPlayer(game.gRoom, null);
    if(!player) {
      return game.stop();
    }

    game.emit(player.getSocket(), result);
    game.gameState = result;
    game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
  }
};
