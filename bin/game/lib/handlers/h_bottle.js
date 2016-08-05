var constants = require('../../constants');
//var constants_io = require('../../../io/constants');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    setActionsLimit = require('../set_action_limits'),
  getPlayerInfo  = require('./../get_player_info'),
  checkCountPrisoners = require('./../check_count_players');

// Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
module.exports = function(game) {
  return function(timer, uid) {
    //var f = constants_io.FIELDS;
    if(!timer) { clearTimeout(game.gTimer); }

    if(!checkCountPrisoners(game)) {
      return game.stop();
    }

    var firstPlayerInfo = null;
    if(uid) {
      firstPlayerInfo = game.gActivePlayers[uid];
    } else { // В случае, если игрок так и не покрутил волчек, берем его uid из настроек
      for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        firstPlayerInfo = game.gActivePlayers[item];
      }
    }

    var firstGender = firstPlayerInfo.sex;
    var male = constants.CONFIG.sex.male;
    var female = constants.CONFIG.sex.female;

    var secondGender = (firstGender == male)? female : male;
    var secondPlayer = randomPlayer(game.gRoom, secondGender, null, game.gPrisoners);

    if(!secondPlayer) {
      return game.stop();
    }

    game.gActivePlayers[secondPlayer.getID()] = getPlayerInfo(secondPlayer);
    game.gActionsQueue = {};

    setActionsLimit(game, 1);
    game.gActionsCount = 2;

    game.gNextGame = constants.G_BOTTLE_KISSES;

    var result = {}; // players: getPlayersID(game.gActivePlayers)
    result.players = getPlayersID(game.gActivePlayers);
    result.next_game = constants.G_BOTTLE_KISSES;

    result.prison = null;
    if(game.gPrisoner !== null) {
      result.prison = {
        id : game.gPrisoner.id,
        vid: game.gPrisoner.vid,
        sex: game.gPrisoner.sex
      }
    }

    var player = randomPlayer(game.gRoom, null, null, game.gPrisoner);
    if(!player) {
      return game.stop();
    }

    game.emit(player.getSocket(), result);

    game.gameState = result;

    game.gTimer = startTimer(game.gHandlers[game.gNextGame], constants.TIMEOUT_GAME);
  }
};
