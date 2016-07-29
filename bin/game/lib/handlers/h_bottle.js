var constants = require('../../constants');
//var constants_io = require('../../../io/constants');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    setActionsLimit = require('../set_action_limits'),
  getPlayerInfo  = require('./../get_player_info'),
  getPrison  = require('./../get_prison');

// Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
module.exports = function(game) {
  return function(timer, uid) {
    //var f = constants_io.FIELDS;
    if(!timer) { clearTimeout(game.gTimer); }

    var firstPlayerInfo = null;
    if(uid) {
      firstPlayerInfo = game.gActivePlayers[uid];
    } else { // В случае, если игрок так и не покрутил волчек, берем его uid из настроек
      for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        firstPlayerInfo = game.gActivePlayers[item];
      }
    }

    var firstGender = firstPlayerInfo.sex;
    var secondGender = (firstGender == constants.CONFIG.sex.male)
             ? constants.CONFIG.sex.female : constants.CONFIG.sex.male;
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
