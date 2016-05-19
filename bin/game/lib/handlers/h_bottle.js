var constants = require('../../constants');
var constants_io = require('../../../io/constants');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    setActionsLimit = require('../set_action_limits'),
  getPlayerInfo  = require('./../get_player_info');

// Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
module.exports = function(game) {
  return function(timer, uid) {
    var f = constants_io.FIELDS;
    if(!timer) { clearTimeout(game.gTimer); }

    var firstPlayerInfo = null;
    if(uid) {
      firstPlayerInfo = game.gActivePlayers[uid];
    } else {
      for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        firstPlayerInfo = game.gActivePlayers[item];
      }
    }

    var firstGender = firstPlayerInfo.sex;
    var secondGender = (firstGender == constants.CONFIG.sex.male)
             ? constants.CONFIG.sex.female : constants.CONFIG.sex.male;
    var secondPlayer = randomPlayer(game.gRoom, secondGender);

    game.gActivePlayers[secondPlayer.getID()] = getPlayerInfo(secondPlayer);
    game.gActionsQueue = {};

    setActionsLimit(game, 1);
    game.gActionsCount = 2;

    game.gNextGame = constants.G_BOTTLE_KISSES;

    var result = {}; // players: getPlayersID(game.gActivePlayers)
    result[f.players] = getPlayersID(game.gActivePlayers);
    result[f.next_game] = constants.G_BOTTLE_KISSES;


    var player = randomPlayer(game.gRoom, null);
    game.emit(player.getSocket(), result);


    game.gameState = result;

    game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
  }
};
